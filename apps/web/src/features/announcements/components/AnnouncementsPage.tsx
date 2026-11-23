import { useState } from "react";
import {
  useAnnouncements,
  useAnnouncementStats,
} from "../hooks/useAnnouncements";
import type {
  Announcement,
  AnnouncementCategory,
  TargetAudience,
} from "../types";
import { AnnouncementDetailDialog } from "./AnnouncementDetailDialog";
import { AnnouncementDialog } from "./AnnouncementDialog";
import { AnnouncementsFilter } from "./AnnouncementsFilter";
import { AnnouncementsHeader } from "./AnnouncementsHeader";
import { AnnouncementsStats } from "./AnnouncementsStats";
import { AnnouncementsTable } from "./AnnouncementsTable";
import { DeleteAnnouncementDialog } from "./DeleteAnnouncementDialog";

export function AnnouncementsPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [isPublished, setIsPublished] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [viewingItem, setViewingItem] = useState<Announcement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);

  // Compute filters for query
  const queryFilters = {
    page,
    limit: 10,
    search: search.trim() ? search.trim() : undefined,
    isPublished:
      isPublished === "true" ? true : isPublished === "false" ? false : undefined,
    targetAudience: targetAudience
      ? (targetAudience as TargetAudience)
      : undefined,
    category: category ? (category as AnnouncementCategory) : undefined,
  };

  const { data: announcementData, isLoading } = useAnnouncements(queryFilters);
  const { data: statsData, isLoading: isStatsLoading } = useAnnouncementStats();

  const handleResetFilters = () => {
    setSearch("");
    setIsPublished("");
    setTargetAudience("");
    setCategory("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handlePublishedChange = (val: string) => {
    setIsPublished(val);
    setPage(1);
  };

  const handleTargetAudienceChange = (val: string) => {
    setTargetAudience(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingItem(announcement);
  };

  const handleDelete = (announcement: Announcement) => {
    setDeletingItem(announcement);
  };

  const handleView = (announcement: Announcement) => {
    setViewingItem(announcement);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <AnnouncementsHeader onAddAnnouncement={() => setIsAddOpen(true)} />

      {/* Stats Cards */}
      <AnnouncementsStats stats={statsData} isLoading={isStatsLoading} />

      {/* Filter Bar */}
      <AnnouncementsFilter
        search={search}
        isPublished={isPublished}
        targetAudience={targetAudience}
        category={category}
        onSearchChange={handleSearchChange}
        onPublishedChange={handlePublishedChange}
        onTargetAudienceChange={handleTargetAudienceChange}
        onCategoryChange={handleCategoryChange}
        onReset={handleResetFilters}
      />

      {/* Main Table */}
      <AnnouncementsTable
        data={announcementData?.data ?? []}
        page={page}
        totalPages={announcementData?.meta.totalPages ?? 1}
        totalData={announcementData?.meta.totalData ?? 0}
        isLoading={isLoading}
        onPageChange={setPage}
        onViewDetail={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setIsAddOpen(true)}
      />

      {/* Dialog: Create Announcement */}
      <AnnouncementDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        announcement={null}
      />

      {/* Dialog: Edit Announcement */}
      <AnnouncementDialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        announcement={editingItem}
      />

      {/* Dialog: View Details */}
      <AnnouncementDetailDialog
        open={Boolean(viewingItem)}
        onOpenChange={(open) => {
          if (!open) setViewingItem(null);
        }}
        announcement={viewingItem}
        onEdit={(item) => {
          setViewingItem(null);
          setEditingItem(item);
        }}
      />

      {/* Dialog: Delete Confirmation */}
      <DeleteAnnouncementDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        announcement={deletingItem}
      />
    </div>
  );
}
