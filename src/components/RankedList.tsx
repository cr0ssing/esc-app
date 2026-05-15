import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { m } from "motion/react";
import { useState } from "react";
import { cn } from "../lib/cn";
import type { Song, VoteState } from "../types";
import { SongCard } from "./SongCard";

type RankedListProps = {
  songs: Song[];
  state: VoteState;
  onReorder: (ids: string[]) => void;
  onPatch: (patch: Partial<VoteState>) => void;
  onPointsChange: (songId: string, points: number | null) => void;
};

export function RankedList({ songs, state, onReorder, onPatch, onPointsChange }: RankedListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isSorting = activeId !== null;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = songs.findIndex((song) => song.id === active.id);
    const newIndex = songs.findIndex((song) => song.id === over.id);
    onReorder(arrayMove(songs, oldIndex, newIndex).map((song) => song.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveId(null);
      }}
    >
      <SortableContext items={songs.map((song) => song.id)} strategy={verticalListSortingStrategy}>
        <m.div className="grid gap-3">
          {songs.map((song, index) => (
            <SortableSong
              key={song.id}
              song={song}
              rank={index + 1}
              state={state}
              isSorting={isSorting}
              onPatch={onPatch}
              onPointsChange={onPointsChange}
            />
          ))}
        </m.div>
      </SortableContext>
    </DndContext>
  );
}

type SortableSongProps = {
  song: Song;
  rank: number;
  state: VoteState;
  isSorting: boolean;
  onPatch: (patch: Partial<VoteState>) => void;
  onPointsChange: (songId: string, points: number | null) => void;
};

function SortableSong({ song, rank, state, isSorting, onPatch, onPointsChange }: SortableSongProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <m.div
      ref={setNodeRef}
      style={style}
      layout={!isSorting}
      className={cn(isDragging && "relative z-20 opacity-92 saturate-[1.2]")}
    >
      <SongCard
        song={song}
        rank={rank}
        layout={!isSorting}
        variant="ranking"
        isSortable
        sortableAttributes={attributes}
        sortableListeners={listeners}
        sortableActivatorRef={setActivatorNodeRef}
        points={state.pointsBySongId[song.id] ?? null}
        note={state.notesBySongId[song.id] ?? ""}
        isWinnerPrediction={state.winnerPredictionId === song.id}
        isPersonalPick={state.personalPickId === song.id}
        onPointsChange={(points) => onPointsChange(song.id, points)}
        onNoteChange={(note) => onPatch({ notesBySongId: { ...state.notesBySongId, [song.id]: note } })}
        onWinnerPredictionChange={() => onPatch({ winnerPredictionId: state.winnerPredictionId === song.id ? null : song.id })}
        onPersonalPickChange={() => onPatch({ personalPickId: state.personalPickId === song.id ? null : song.id })}
      />
    </m.div>
  );
}
