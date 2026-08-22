export interface RecordDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  type: "create" | "view" | "detail";
  data?: any;
  citizens?: any[];
  locations?: any[];
  onOpenDetail?: (table: string, id: any) => void;
  onOpenCreate?: (table: string, initialData?: any) => void;
  onRefresh?: () => void;
  devMode?: boolean;
  inline?: boolean;
  draftGeometry?: any;
  setDraftGeometry?: (v: any) => void;
  allTapus?: any[];
  regions?: any[];
  addTab?: (tab: any) => void;
}

export interface FieldProps {
  field: string;
  values: any;
  setValues: (v: any) => void;
  isEditing: boolean;
  translateHeader: (h: string) => string;
  renderTooltip: (h: string) => React.ReactNode;
  isRequiredFieldEmpty: (field: string) => boolean;
  onOpenDetail?: (table: string, id: any) => void;
  vatandaslar?: any[];
  mevkiler?: any[];
  table?: string;
  draftGeometry?: any;
  setDraftGeometry?: (v: any) => void;
  error?: string;
  isMandatory?: boolean;
  isTouched?: boolean;
  onBlur?: () => void;
}

