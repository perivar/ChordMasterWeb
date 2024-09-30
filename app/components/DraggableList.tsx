import React, { useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Generic interface that accepts any type `T`
interface DraggableListProps<T> {
  items: T[];
  getId: (item: T) => UniqueIdentifier; // Returns a string or number
  onReorder: (newOrder: T[]) => void;
  renderItem: (
    item: T,
    isDragging: boolean,
    attributes?: DraggableAttributes,
    listeners?: SyntheticListenerMap
  ) => React.ReactNode; // Function to render the item, exposing isDragging
  renderOverlay?: (item: T) => React.ReactNode; // Function to render the DragOverlay
}

export function DraggableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  renderOverlay,
}: DraggableListProps<T>) {
  const [list, setList] = useState(items);
  const [activeItem, setActiveItem] = useState<T | null>(null); // Track the item being dragged

  // Initialize sensors for mouse and touch input
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Starts dragging after moving 10px
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Delay before activating drag for touch input
        tolerance: 5, // Tolerance for slight touch movements
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null); // Reset active item after drag ends

    if (over && active.id !== over.id) {
      const oldIndex = list.findIndex(item => getId(item) === active.id);
      const newIndex = list.findIndex(item => getId(item) === over.id);

      const newOrder = arrayMove(list, oldIndex, newIndex);
      setList(newOrder);
      onReorder(newOrder);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = list.find(item => getId(item) === active.id);
    setActiveItem(draggedItem || null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}>
      <SortableContext
        items={list.map(getId)}
        strategy={verticalListSortingStrategy}>
        {list.map(item => (
          <DraggableItem key={getId(item)} id={getId(item)}>
            {(isDragging, attributes, listeners) =>
              renderItem(item, isDragging, attributes, listeners)
            }
          </DraggableItem>
        ))}
      </SortableContext>

      {renderOverlay && (
        <DragOverlay>
          {activeItem ? renderOverlay(activeItem) : null}
        </DragOverlay>
      )}
    </DndContext>
  );
}

interface DraggableItemProps {
  id: UniqueIdentifier;
  children: (
    isDragging: boolean,
    attributes?: DraggableAttributes,
    listeners?: SyntheticListenerMap
  ) => React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children(isDragging, attributes, listeners)}
    </div>
  );
};
