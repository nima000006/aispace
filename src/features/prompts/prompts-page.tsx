"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Plus, Search, Star, StarOff, Trash2, Edit, Tag,
  BookMarked, Lock, Globe, Copy, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePrompts } from "@/store/app-store";
import { cn, truncate } from "@/lib/utils";
import { toast } from "sonner";
import type { Prompt } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

const SAMPLE_TAGS = ["coding", "writing", "analysis", "creative", "business", "research"];

export function PromptsPage() {
  const t = useTranslations("prompts");
  const {
    prompts, searchQuery, selectedTags,
    addPrompt, updatePrompt, deletePrompt, toggleFavorite,
    setSearchQuery, setSelectedTags,
  } = usePrompts();

  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const openNew = () => {
    setEditingPrompt(null);
    setTitle(""); setContent(""); setDescription(""); setTags([]); setIsPublic(false);
    setShowForm(true);
  };

  const openEdit = (p: Prompt) => {
    setEditingPrompt(p);
    setTitle(p.title); setContent(p.content);
    setDescription(p.description ?? ""); setTags(p.tags); setIsPublic(p.isPublic);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, { title, content, description, tags, isPublic });
      toast.success("Prompt updated");
    } else {
      addPrompt({ title, content, description, tags, isPublic, isFavorite: false });
      toast.success("Prompt saved");
    }
    setShowForm(false);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const filtered = prompts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q));
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));
    const matchesFav = !filterFavorites || p.isFavorite;
    return matchesSearch && matchesTags && matchesFav;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--fg)]">{t("title")}</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            {prompts.length} prompts saved
          </p>
        </div>
        <Button variant="gradient" onClick={openNew} className="gap-1.5 self-start sm:self-auto shrink-0">
          <Plus className="w-4 h-4" />
          {t("newPrompt")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
        <Input
          placeholder={t("search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="w-full sm:max-w-xs"
        />
        <Button
          variant={filterFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterFavorites(!filterFavorites)}
          className="gap-1.5"
        >
          <Star className="w-3.5 h-3.5" />
          Favorites
        </Button>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                selectedTags.includes(tag)
                  ? "border-[var(--primary)] bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                  : "border-[var(--card-border)] text-[var(--muted-fg)] hover:border-[var(--primary)]"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookMarked className="w-12 h-12 text-[var(--card-border)] mb-3" />
          <h3 className="text-base font-semibold text-[var(--fg)] mb-1">
            {prompts.length === 0 ? "No prompts yet" : "No results"}
          </h3>
          <p className="text-sm text-[var(--muted-fg)] mb-4">
            {prompts.length === 0
              ? "Create your first prompt to get started."
              : "Try adjusting your search or filters."}
          </p>
          {prompts.length === 0 && (
            <Button onClick={openNew} variant="gradient" size="sm">
              <Plus className="w-4 h-4 me-1.5" /> {t("newPrompt")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial="hidden" animate="visible" variants={fadeUp} custom={i}
            >
              <Card className="card-hover h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                      {prompt.title}
                    </CardTitle>
                    <button
                      onClick={() => toggleFavorite(prompt.id)}
                      className="text-[var(--muted-fg)] hover:text-amber-500 transition-colors shrink-0"
                    >
                      {prompt.isFavorite
                        ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        : <Star className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {prompt.isPublic
                      ? <Globe className="w-3 h-3 text-[var(--muted-fg)]" />
                      : <Lock className="w-3 h-3 text-[var(--muted-fg)]" />
                    }
                    <span className="text-[10px] text-[var(--muted-fg)]">
                      v{prompt.version}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <p className="text-xs text-[var(--muted-fg)] leading-relaxed line-clamp-3 bg-[var(--muted-bg)] rounded-lg p-2.5 font-mono">
                    {prompt.content}
                  </p>
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-auto pt-1 border-t border-[var(--card-border)]">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleCopy(prompt.content)}
                    >
                      <Copy className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(prompt)}
                    >
                      <Edit className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        deletePrompt(prompt.id);
                        toast.success("Prompt deleted");
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-[var(--fg)] mb-5">
                {editingPrompt ? "Edit Prompt" : t("newPrompt")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg)] mb-1.5">
                    {t("promptTitle")} *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Code Review Expert"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--fg)] mb-1.5">
                    {t("promptContent")} *
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="You are an expert code reviewer..."
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--fg)] mb-1.5">
                    {t("tags")}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs border transition-colors",
                          tags.includes(tag)
                            ? "border-[var(--primary)] bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                            : "border-[var(--card-border)] text-[var(--muted-fg)] hover:border-[var(--primary)]"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--fg)]">{t("makePublic")}</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleSave}>
                  {editingPrompt ? "Update" : "Save"} Prompt
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
