import React, { useState, useEffect } from 'react';
import { Switch } from '../../../ui/switch';
import { Gear } from '../../../icons/Gear';
import { FixedExtensionEntry } from '../../../ConfigContext';
import { getSubtitle, getFriendlyTitle } from './ExtensionList';

interface ExtensionItemProps {
  extension: FixedExtensionEntry;
  onToggle: (extension: FixedExtensionEntry) => Promise<boolean | void>;
  onConfigure: (extension: FixedExtensionEntry) => void;
}

export default function ExtensionItem({ extension, onToggle, onConfigure }: ExtensionItemProps) {
  // Add local state to track the visual toggle state
  const [visuallyEnabled, setVisuallyEnabled] = useState(extension.enabled);
  // Track if we're in the process of toggling
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (ext: FixedExtensionEntry) => {
    // Prevent multiple toggles while one is in progress
    if (isToggling) return;

    setIsToggling(true);

    // Immediately update visual state
    const newState = !ext.enabled;
    setVisuallyEnabled(newState);

    try {
      // Call the actual toggle function that performs the async operation
      await onToggle(ext);
      // Success case is handled by the useEffect below when extension.enabled changes
    } catch (error) {
      // If there was an error, revert the visual state
      console.log('Toggle failed, reverting visual state');
      setVisuallyEnabled(!newState);
    } finally {
      setIsToggling(false);
    }
  };

  // Update visual state when the actual extension state changes
  useEffect(() => {
    if (!isToggling) {
      setVisuallyEnabled(extension.enabled);
    }
  }, [extension.enabled, isToggling]);

  const renderFormattedSubtitle = () => {
    const subtitle = getSubtitle(extension);
    return subtitle.split('\n').map((part, index) => (
      <React.Fragment key={index}>
        {index === 0 ? part : <span className="font-mono text-xs">{part}</span>}
        {index < subtitle.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div
      className="flex justify-between rounded-lg transition-colors border border-borderSubtle p-4 pt-3 hover:border-borderProminent hover:cursor-pointer"
      onClick={() => handleToggle(extension)}
    >
      <div className="flex flex-col w-max-[90%]">
        <h3 className="text-textStandard">{getFriendlyTitle(extension)}</h3>
        <p className="text-xs text-textSubtle">{renderFormattedSubtitle()}</p>
      </div>

      <div
        className="flex items-center justify-end gap-2 w-max-[10%]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Only show config button for non-builtin extensions */}
        {extension.type !== 'builtin' && (
          <button
            className="text-textSubtle hover:text-textStandard"
            onClick={() => onConfigure(extension)}
          >
            <Gear className="h-4 w-4" />
          </button>
        )}
        <Switch
          checked={(isToggling && visuallyEnabled) || extension.enabled}
          onCheckedChange={() => handleToggle(extension)}
          variant="mono"
        />
      </div>
    </div>
  );
}
