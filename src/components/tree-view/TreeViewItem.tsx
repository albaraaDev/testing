import React from 'react';
import { FlattenedTreeItem } from './types';
import clsx from 'clsx';

interface TreeViewItemProps {
  item: FlattenedTreeItem;
  onToggle: () => void;
  onSelect: () => void;
  suffix?: React.ReactNode;
  expandable?: boolean;
}

export const TreeViewItem: React.FC<TreeViewItemProps> = ({
  item,
  onToggle,
  onSelect,
  suffix,
  expandable = true
}) => {
  const indentationPadding = `${item.depth * 10}px`;
  return (
    <div className="max-w-full w-full flex flex-row">
      <div
        style={{
          width: indentationPadding,
          minWidth: indentationPadding
        }}
      />
      <div className="min-w-0 flex-grow">
        {item.isPlaceholder ? (
          <div className="flex items-center h-9 text-gray-500 italic">
            <span className="ms-6">{item.label}</span>
          </div>
        ) : (
          <div
            className={clsx(
              'flex items-center h-12 cursor-pointer select-none gap-2 px-2',
              item.depth === 0 ? 'border rounded-md' : 'border-0',
              item.depth % 2 == 0 ? 'bg-gray-200' : 'bg-gray-100',
              {
                'bg-info-light text-info': item.isSelected,
                'hover:bg-gray-100': !item.isSelected
              }
            )}
            onClick={onSelect}
          >
            {expandable && item.hasChildren && (
              <div
                className="flex items-center justify-center w-5 h-5 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {item.isLoading ? (
                  <div className="flex items-center justify-center w-5 h-5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-primary animate-spin"></div>
                  </div>
                ) : (
                  <span className="h-4 w-4 flex items-center justify-center font-semibold text-lg">
                    {item.isExpanded ? '-' : '+'}
                  </span>
                )}
              </div>
            )}
            {(!expandable || !item.hasChildren) && <div className="w-2"></div>}
            <div className="flex-grow truncate">{item.label}</div>
            {suffix && <div className="flex items-center">{suffix}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
