import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, CloudOff, RefreshCw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LynOfflineIndicator = () => {
  const { isOnline, forceOffline, toggleForceOffline, pendingCount, isSyncing, syncPendingActions } = useOfflineSync();

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      {isOnline && pendingCount === 0 && !isSyncing && (
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
      )}

      {!isOnline && (
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
            <p>{forceOffline ? "Offline mode enabled" : "No network"}. {pendingCount} changes pending.</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isSyncing && (
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
      )}

      {isOnline && pendingCount > 0 && !isSyncing && (
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30 cursor-pointer"
              onClick={() => syncPendingActions()}
            >
              <CloudOff className="h-3 w-3" />
              {pendingCount} pending
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to sync {pendingCount} pending changes</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Offline Mode Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={forceOffline ? "destructive" : "outline"}
            size="sm"
            onClick={toggleForceOffline}
            className="h-7 px-2"
          >
            <Power className="h-3 w-3 mr-1" />
            {forceOffline ? "Go Online" : "Go Offline"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{forceOffline ? "Disable offline mode and sync" : "Enable offline mode for testing"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default LynOfflineIndicator;