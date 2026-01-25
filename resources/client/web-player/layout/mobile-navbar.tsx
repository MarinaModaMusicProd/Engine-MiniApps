import {Navbar} from '@common/ui/navigation/navbar/navbar';

export function MobileNavbar() {
  return (
    <Navbar
      color="bg-elevated"
      darkModeColor="bg-elevated"
      logoColor="matchMode"
      border="border-b"
      textColor="text-main"
      size={null}
      className="flex-shrink-0 px-2 py-8"
    />
  );
}
