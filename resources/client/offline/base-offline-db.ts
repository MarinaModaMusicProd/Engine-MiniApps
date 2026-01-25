export type ListenCallbacks<T> = {
  onItemUpdated: (item: T) => void;
  onItemDeleted: (item: T) => void;
};

interface TypedListenersMap<C> extends Map<keyof C, C[keyof C][]> {
  get<K extends keyof C>(key: K): C[K][] | undefined;
  set<K extends keyof C>(key: K, value: C[K][]): this;
}

export abstract class BaseOfflineDb<
  T extends {id: number},
  Callbacks extends ListenCallbacks<T> = ListenCallbacks<T>,
> {
  protected primaryKeyPath: string = 'id';
  protected abstract dbName: string;
  protected abstract dbVersion: number;
  protected abstract dbStoreName: string;

  protected listeners: TypedListenersMap<Callbacks> = new Map();

  protected db: IDBDatabase | null = null;

  listen<Name extends keyof Callbacks>(
    eventName: Name,
    callback: Callbacks[Name],
  ): () => void {
    const otherListeners = this.listeners.get(eventName) ?? [];
    otherListeners.push(callback);
    this.listeners.set(eventName, otherListeners);
    return () => {
      const listeners = (this.listeners.get(eventName) ?? []).filter(
        l => l !== callback,
      );
      this.listeners.set(eventName, listeners);
    };
  }

  protected async getItem(id: any, index?: string): Promise<T | null> {
    const db = this.db ?? (await this.getDatabase());
    const transaction = db.transaction([this.dbStoreName], 'readonly');
    const store = transaction.objectStore(this.dbStoreName);
    const request = index
      ? store.index(index).get(IDBKeyRange.only(id))
      : store.get(id);
    return new Promise(resolve => {
      request.onsuccess = () => resolve(request.result as T | null);
      request.onerror = () => resolve(null);
    });
  }

  protected async getAllItems(
    index?: string,
    value?: string | number,
  ): Promise<T[]> {
    const db = await this.getDatabase();
    const transaction = db.transaction([this.dbStoreName], 'readonly');
    const store = transaction.objectStore(this.dbStoreName);

    const request = index
      ? store.index(index).getAll(IDBKeyRange.only(value))
      : store.getAll();
    return new Promise(resolve => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => resolve([]);
    });
  }

  protected async getAllKeys<T extends number | string = number>(
    index?: string,
    value?: string | number,
  ): Promise<T[]> {
    const db = await this.getDatabase();
    const transaction = db.transaction([this.dbStoreName], 'readonly');
    const store = transaction.objectStore(this.dbStoreName);
    const request = index
      ? store.index(index).getAllKeys(IDBKeyRange.only(value))
      : store.getAllKeys();
    return new Promise<T[]>(resolve => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => resolve([]);
    });
  }

  protected async putItem(item: T): Promise<boolean> {
    const db = await this.getDatabase();
    const transaction = db.transaction([this.dbStoreName], 'readwrite');
    const store = transaction.objectStore(this.dbStoreName);
    const request = store.put(item);
    return new Promise(resolve => {
      request.onsuccess = () => {
        this.listeners.get('onItemUpdated')?.forEach(l => l(item));
        resolve(true);
      };
      request.onerror = () => resolve(false);
    });
  }

  protected async deleteItem(id: string | number): Promise<boolean> {
    const item = await this.getItem(id);
    if (!item) return true;

    const db = await this.getDatabase();
    const transaction = db.transaction([this.dbStoreName], 'readwrite');
    const store = transaction.objectStore(this.dbStoreName);
    const request = store.delete(id);
    return new Promise(resolve => {
      request.onsuccess = () => {
        this.listeners.get('onItemDeleted')?.forEach(l => l(item));
        resolve(true);
      };
      request.onerror = () => resolve(false);
    });
  }

  protected async deleteAllItems(): Promise<boolean> {
    const db = await this.getDatabase();
    const transaction = db.transaction([this.dbStoreName], 'readwrite');
    const store = transaction.objectStore(this.dbStoreName);
    const request = store.clear();
    return new Promise(resolve => {
      request.onsuccess = () => resolve(true);
    });
  }

  protected async getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.dbStoreName)) {
          const store = db.createObjectStore(this.dbStoreName, {
            keyPath: this.primaryKeyPath,
          });
          this.createIndices(store);
        }
      };
    });
  }

  protected createIndices(store: IDBObjectStore): void {
    // override in subclass
  }

  // track was either offlined as part of album/playlist or individually
  protected refId(
    track?: {id: number | string},
    ref?: {id: number | string; model_type: 'album' | 'playlist'},
  ): string {
    return ref ? `${ref.id}-${ref.model_type}` : `self-${track!.id}`;
  }
}
