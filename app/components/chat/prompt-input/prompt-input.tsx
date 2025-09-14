"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { PlusIcon } from "@/components/icons/plus-icon";
import { Settings2Icon } from "@/components/icons/settings2-icon";
import { SendIcon } from "@/components/icons/send-icon";
import { XIcon } from "@/components/icons/x-icon";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { PaintBrushIcon } from "@/components/icons/paintbrush-icon";
import { TelescopeIcon } from "@/components/icons/telescope-icon";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon";
import { MicIcon } from "@/components/icons/mic-icon";

// --- Utility Function ---
type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string { return inputs.filter(Boolean).join(" "); }

// --- Radix Primitives ---
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-xl bg-popover p-2 text-popover-foreground shadow-md outline-none animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="relative bg-card rounded-[28px] overflow-hidden shadow-2xl p-1">
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 z-10 p-1 rounded-full transition-all bg-background/50 hover:bg-accent">
          <XIcon className="w-5 h-5 text-muted-foreground hover:text-gray-500" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;


// --- Internal Components ---
const toolsList = [
  { id: 'createImage', name: 'Create an image', shortName: 'Image', icon: PaintBrushIcon },
  { id: 'searchWeb', name: 'Search the web', shortName: 'Search', icon: GlobeIcon },
  { id: 'writeCode', name: 'Write or code', shortName: 'Write', icon: PencilIcon },
  { id: 'deepResearch', name: 'Run deep research', shortName: 'Deep Search', icon: TelescopeIcon, extra: '5 left' },
  { id: 'thinkLonger', name: 'Think for longer', shortName: 'Think', icon: LightbulbIcon },
];

interface ToolButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tooltip: string;
  onClick: () => void;
  className?: string;
}

const ToolButton = ({ icon: Icon, tooltip, onClick, className = '' }: ToolButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex justify-center items-center w-8 h-8 text-black rounded-full transition-colors hover:bg-accent focus-visible:outline-none",
          className
        )}
      >
        <Icon className="w-6 h-6" />
        <span className="sr-only">{tooltip}</span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" showArrow={true}>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

interface ImagePreviewDialogProps {
  imagePreview: string | null;
  isImageDialogOpen: boolean;
  setIsImageDialogOpen: (open: boolean) => void;
  onRemoveImage: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ImagePreviewDialog = ({
  imagePreview,
  isImageDialogOpen,
  setIsImageDialogOpen,
  onRemoveImage
}: ImagePreviewDialogProps) => (
  imagePreview && (
    <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
      <div className="relative mb-1 w-fit rounded-[1rem] px-1 pt-1">
        <button type="button" className="transition-transform" onClick={() => setIsImageDialogOpen(true)}>
          <img src={imagePreview} alt="Image preview" className="h-14.5 w-14.5 rounded-[1rem]" />
        </button>
        <button
          onClick={onRemoveImage}
          className="flex absolute top-2 right-2 z-10 justify-center items-center w-4 h-4 text-black rounded-full transition-colors bg-white/50 hover:bg-accent"
          aria-label="Remove image"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      <DialogContent>
        <img src={imagePreview} alt="Full size preview" className="w-full max-h-[95vh] object-contain rounded-[24px]" />
      </DialogContent>
    </Dialog>
  )
);

interface ToolSelectionProps {
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (open: boolean) => void;
}

const ToolSelection = ({ selectedTool, setSelectedTool, isPopoverOpen, setIsPopoverOpen }: ToolSelectionProps) => {
  const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null;
  const ActiveToolIcon = activeTool?.icon;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex gap-2 items-center p-2 h-8 text-sm text-black rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-ring"
            >
              <Settings2Icon className="w-4 h-4" />
              {!selectedTool && 'Tools'}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" showArrow={true}>
          <p>Explore Tools</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="start">
        <div className="flex flex-col gap-1">
          {toolsList.map(tool => (
            <button
              key={tool.id}
              onClick={() => { setSelectedTool(tool.id); setIsPopoverOpen(false); }}
              className="flex gap-2 items-center p-2 w-full text-sm text-left text-white rounded-md hover:bg-accent hover:text-black"
            >
              <tool.icon className="w-4 h-4" />
              <span>{tool.name}</span>
              {tool.extra && <span className="ml-auto text-xs text-muted-foreground">{tool.extra}</span>}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ActionButtonsProps {
  hasValue: boolean;
  onAudioClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ActionButtons = ({ hasValue, onAudioClick, onSubmit }: ActionButtonsProps) => (
  <div className="flex gap-2 items-center ml-auto">
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="flex justify-center items-center w-8 h-8 text-black rounded-full transition-colors hover:bg-accent focus-visible:outline-none"
          onClick={onAudioClick}
        >
          <MicIcon className="w-5 h-5" />
          <span className="sr-only">Record voice</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" showArrow={true}>
        <p>Record voice</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="submit"
          disabled={!hasValue}
          className="flex justify-center items-center w-8 h-8 text-sm font-medium text-white bg-black rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none hover:bg-black/80 disabled:bg-black/40"
          onClick={onSubmit}
        >
          <SendIcon className="w-6 h-6 text-bold" />
          <span className="sr-only">Send message</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" showArrow={true}>
        <p>Send</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

// --- The Final, Self-Contained PromptBox Component ---
interface PromptBoxProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (message: string) => void;
  onSendAudio?: (audioBase64: string) => void;
  onOpenAudioDialog?: () => void;
}

export const PromptBox = React.forwardRef<HTMLTextAreaElement, PromptBoxProps>(
  ({ className, onSubmit, onSendAudio, onOpenAudioDialog, ...props }, ref) => {

    // ... all state and handlers are unchanged ...
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [value, setValue] = React.useState("");
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [selectedTool, setSelectedTool] = React.useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
    // Audio dialog is now controlled by parent; no local state here

    React.useImperativeHandle(ref, () => internalTextareaRef.current!, []);
    React.useLayoutEffect(() => { const textarea = internalTextareaRef.current; if (textarea) { textarea.style.height = "auto"; const newHeight = Math.min(textarea.scrollHeight, 200); textarea.style.height = `${newHeight}px`; } }, [value]);
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setValue(e.target.value); if (props.onChange) props.onChange(e); };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    const handlePlusClick = () => { fileInputRef.current?.click(); };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file && file.type.startsWith("image/")) { const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); } event.target.value = ""; };
    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setImagePreview(null); if(fileInputRef.current) { fileInputRef.current.value = ""; } };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && onSubmit) {
        onSubmit(value.trim());
        setValue("");
        setImagePreview(null);
      }
    };

    const handleSendAudio = (audioBase64: string) => {
      if (onSendAudio) {
        onSendAudio(audioBase64);
      }
    };
    
    const hasValue = value.trim().length > 0 || !!imagePreview;
    const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null;
    const ActiveToolIcon = activeTool?.icon;

    return (
      <form onSubmit={handleSubmit} className={cn("flex flex-col p-2 bg-white border shadow-sm transition-colors cursor-text rounded-[28px]", className)}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>

        <ImagePreviewDialog
          imagePreview={imagePreview}
          isImageDialogOpen={isImageDialogOpen}
          setIsImageDialogOpen={setIsImageDialogOpen}
          onRemoveImage={handleRemoveImage}
        />

        <textarea ref={internalTextareaRef} rows={1} value={value} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Escribe aquí tu mensaje..." className="p-3 w-full text-black bg-transparent border-0 resize-none custom-scrollbar placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-none min-h-12" {...props} />

        <div className="mt-0.5 p-1 pt-0">
          <TooltipProvider delayDuration={100}>
            <div className="flex gap-2 items-center">
              <ToolButton
                icon={PlusIcon}
                tooltip="Attach image"
                onClick={handlePlusClick}
              />

              <ToolSelection
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                isPopoverOpen={isPopoverOpen}
                setIsPopoverOpen={setIsPopoverOpen}
              />

              {activeTool && (
                <>
                  <div className="w-px h-4 bg-border" />
                  <button onClick={() => setSelectedTool(null)} className="flex h-8 gap-2 rounded-full px-2 text-sm hover:bg-accent cursor-pointer text-[#2294ff] transition-colors flex-row items-center justify-center">
                    {ActiveToolIcon && <ActiveToolIcon className="w-4 h-4" />}
                    {activeTool.shortName}
                    <XIcon className="w-4 h-4" />
                  </button>
                </>
              )}

              <ActionButtons
                hasValue={hasValue}
                onAudioClick={() => onOpenAudioDialog?.()}
                onSubmit={handleSubmit}
              />
            </div>
          </TooltipProvider>
        </div>

        {/* Audio Dialog handled by parent */}
      </form>
    );
  }
);
PromptBox.displayName = "PromptBox";