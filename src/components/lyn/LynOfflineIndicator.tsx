import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LynOfflineIndicator = () => {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  if (isOnline && pendingCount === 0) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
            <Wifi className="h-3 w-3" />
            Online
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connected and synced</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isOnline) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-600 border-red-500/30 animate-pulse">
            <WifiOff className="h-3 w-3" />
            Offline
            {pendingCount > 0 && (
              <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">
                {pendingCount}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Working offline. {pendingCount} changes pending sync.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isSyncing) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Syncing...
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Syncing {pendingCount} pending changes...</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (pendingCount > 0) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <CloudOff className="h-3 w-3" />
            {pendingCount} pending
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{pendingCount} changes waiting to sync</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return null;
};

export default LynOfflineIndicator;