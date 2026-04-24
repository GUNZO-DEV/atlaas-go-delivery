import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, X } from "lucide-react";
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from "date-fns";

interface Props {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}

// Generate 30-minute slots from 10:00 to 22:30
const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const totalMinutes = 10 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return { h, m, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
});

export default function ScheduleDeliveryPicker({ value, onChange }: Props) {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 7);

  const selectedDate = value ? startOfDay(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }
    // keep previous time if any, otherwise default to next available slot
    if (value) {
      const newDate = setMinutes(setHours(date, value.getHours()), value.getMinutes());
      onChange(newDate);
    } else {
      onChange(setMinutes(setHours(date, 12), 0));
    }
  };

  const handleTimeSelect = (h: number, m: number) => {
    const base = value ? new Date(value) : new Date();
    onChange(setMinutes(setHours(base, h), m));
  };

  const isSlotPast = (h: number, m: number) => {
    if (!selectedDate) return false;
    const slot = setMinutes(setHours(new Date(selectedDate), h), m);
    return isBefore(slot, new Date());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Schedule for later (optional)</Label>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {value ? format(value, "MMM d") : "Today"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
            <CalendarComponent
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={(d) => isBefore(d, today) || isBefore(maxDate, d)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start font-normal" disabled={!value}>
              <Clock className="mr-2 h-4 w-4" />
              {value ? format(value, "p") : "ASAP"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 z-50 bg-popover" align="start">
            <div className="grid grid-cols-3 gap-1 max-h-64 overflow-y-auto">
              {TIME_SLOTS.map((slot) => {
                const past = isSlotPast(slot.h, slot.m);
                const active =
                  value && value.getHours() === slot.h && value.getMinutes() === slot.m;
                return (
                  <Button
                    key={slot.label}
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    disabled={past}
                    onClick={() => handleTimeSelect(slot.h, slot.m)}
                    className="text-xs h-8"
                  >
                    {slot.label}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Scheduled for {format(value, "EEEE, MMM d 'at' p")}
        </p>
      )}
    </div>
  );
}
