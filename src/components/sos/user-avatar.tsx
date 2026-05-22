import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-8", className)}>
      {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
      <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
