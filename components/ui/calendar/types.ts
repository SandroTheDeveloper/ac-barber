export type CalendarPickerProps = {
  value?: string | null;
  onSelectDate: (date: string) => void;

  minDate?: string;
  maxDate?: string;

  disabledWeekDays?: number[]; // 0 = dom, 1 = lun
  showSelectedLabel?: boolean;
};
