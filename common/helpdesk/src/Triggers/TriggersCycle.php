<?php namespace Helpdesk\Triggers;

use App\Models\Ticket;
use Helpdesk\Models\Conversation;
use Helpdesk\Models\Trigger;
use Helpdesk\Triggers\Actions\Actions;
use Helpdesk\Triggers\Conditions\Conditions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Livechat\Models\Chat;

class TriggersCycle
{
    protected Actions $actions;
    protected Conditions $conditions;

    protected array $alreadyFiredTriggers = [];
    protected int $timesLooped = 0;
    protected int $triggersFired = 0;

    public function __construct()
    {
        $this->actions = new Actions();
        $this->conditions = new Conditions();
    }

    public function runAgainstConversation(
        Conversation $conversation,
        array|null $conversationDataBeforeUpdate = null,
        Collection|null $triggers = null,
    ): array {
        $triggers ??= Trigger::all();

        $this->runCycle(
            $triggers,
            $conversation,
            $conversationDataBeforeUpdate,
        );

        $response = [
            'timesFired' => $this->triggersFired,
            'timesLooped' => $this->timesLooped,
        ];

        $this->alreadyFiredTriggers = [];
        $this->timesLooped = 0;
        $this->triggersFired = 0;

        return $response;
    }

    public function executeTimeBasedTriggers(): void
    {
        $config = (new TriggersConfig())->get();
        $triggers = Trigger::all()->filter(
            fn(Trigger $trigger) => $trigger
                ->conditions()
                ->map(fn($c) => $config['conditions'][$c['name']])
                ->some('time_based', '=', true),
        );

        if (class_exists(Ticket::class)) {
            Ticket::with('latest_reply')
                ->whereDoesntHave('tags', function (Builder $builder) {
                    $builder->where('tags.name', 'locked');
                })
                ->eachById(function (Ticket $ticket) use ($triggers) {
                    $this->runAgainstConversation($ticket, null, $triggers);
                }, 500);
        }

        if (class_exists(Chat::class)) {
            Chat::with('lastMessage')
                ->whereDoesntHave('tags', function (Builder $builder) {
                    return $builder->where('tags.name', 'locked');
                })
                ->eachById(function (Chat $chat) use ($triggers) {
                    $this->runAgainstConversation($chat, null, $triggers);
                }, 500);
        }
    }

    /**
     * Triggers cycle will run every trigger against a conversation.
     * If trigger fires and "trigger action" updates conversation, the cycle will run again
     * skipping triggers that were already checked (regardless of them actually firing)
     */
    protected function runCycle(
        Collection $triggers,
        Conversation $conversation,
        ?array $conversationDataBeforeUpdate = null,
    ): void {
        foreach ($triggers as $trigger) {
            $this->timesLooped++;

            if (
                $this->triggerShouldFire(
                    $trigger,
                    $conversation,
                    $conversationDataBeforeUpdate,
                )
            ) {
                $result = $this->fireTrigger($trigger, $conversation);

                if ($result['command'] === 'abort') {
                    break;
                } elseif ($result['command'] === 'continue') {
                    continue;
                } elseif ($result['command'] === 'restart') {
                    $this->runCycle(
                        $triggers,
                        $result['conversation'],
                        $conversationDataBeforeUpdate,
                    );
                    break;
                }
            }
        }
    }

    private function fireTrigger(
        Trigger $trigger,
        Conversation $conversation,
    ): array {
        $trigger->increment('times_fired');

        $conversation = $this->actions->execute($conversation, $trigger);

        //mark this trigger as already 'fired' so we don't fire same triggers twice
        $this->alreadyFiredTriggers[] = $trigger->id;

        //if one of this trigger's actions updates conversation or
        //one of its relationships, we need to run all triggers
        //against updated conversation again, except triggers that already fired
        if ($this->actions->updatesConversation($trigger->actions())) {
            $command = 'restart';
        }

        //if one of this trigger's actions aborts trigger
        //cycle (for example 'delete_conversation' action), bail
        if ($this->actions->abortsCycle($trigger->actions())) {
            $command = 'abort';
        }

        $this->triggersFired++;

        return [
            'command' => $command ?? 'continue',
            'conversation' => $conversation,
        ];
    }

    /**
     * Determine if given trigger should fire based on specified arguments.
     */
    protected function triggerShouldFire(
        Trigger $trigger,
        Conversation $conversation,
        array|null $conversationDataBeforeUpdate = null,
    ): bool {
        // if this trigger has already been fired, continue to next trigger
        if (in_array($trigger->id, $this->alreadyFiredTriggers)) {
            return false;
        }

        return $this->conditions->areMet(
            $trigger,
            $conversation,
            $conversationDataBeforeUpdate,
        );
    }
}
