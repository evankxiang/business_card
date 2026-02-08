"use client";

import { useState, useCallback, useEffect } from "react";
import pLimit from "p-limit";
import { UploadZone } from "./components/UploadZone";
import { ResultsTable } from "./components/ResultsTable";
import { GlassPanel } from "./components/GlassPanel";
import { BusinessCardData, ExtractedData } from "./lib/types";
import { Loader2, User, RefreshCw } from "lucide-react";

const limit = pLimit(3);

interface DBContact {
  id: string;
  created_at: string;
  poc_name: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  website: string | null;
  address: string | null;
  user_notes: string | null;
  source_filename: string | null;
  confidence_score: number | null;
}

export default function Home() {
  const [cards, setCards] = useState<BusinessCardData[]>([]);
  const [pocName, setPocName] = useState("");
  const [confirmedPoc, setConfirmedPoc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from database on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to load contacts");
      const data: DBContact[] = await response.json();

      // Convert DB format to app format
      const loadedCards: BusinessCardData[] = data.map((c) => ({
        id: c.id,
        source_filename: c.source_filename || "Unknown",
        status: "done" as const,
        full_name: c.full_name,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        title: c.title,
        website: c.website,
        address: c.address,
        notes: null,
        user_notes: c.user_notes,
        confidence_score: c.confidence_score || 0,
        poc_name: c.poc_name,
      }));

      setCards(loadedCards);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContactToDB = async (contact: Omit<BusinessCardData, 'id'>, poc: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poc_name: poc,
          full_name: contact.full_name,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          title: contact.title,
          website: contact.website,
          address: contact.address,
          user_notes: contact.user_notes,
          source_filename: contact.source_filename,
          confidence_score: contact.confidence_score,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save contact to DB");
        return null;
      }

      // Return the DB-generated ID
      const savedContacts = await response.json();
      return savedContacts[0]?.id || null;
    } catch (error) {
      console.error("Error saving to DB:", error);
      return null;
    }
  };

  const processFile = async (file: File, id: string) => {
    try {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "processing" } : c))
      );

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataArray: ExtractedData[] = await response.json();

      if (dataArray.length === 0) {
        throw new Error("No contacts extracted from image");
      }

      // Process all extracted contacts - prepare data without IDs first
      const contactsToSave = dataArray.map((data, idx) => ({
        source_filename: dataArray.length > 1 ? `${file.name} (card ${idx + 1})` : file.name,
        status: "done" as const,
        full_name: data.full_name,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        title: data.title,
        website: data.website,
        address: data.address,
        notes: data.notes,
        user_notes: null,
        confidence_score: data.confidence_score,
        poc_name: confirmedPoc,
      }));

      // Save all to database and collect the DB-generated IDs
      const savedContacts: BusinessCardData[] = [];
      for (const contact of contactsToSave) {
        const dbId = await saveContactToDB(contact, confirmedPoc);
        if (dbId) {
          savedContacts.push({
            ...contact,
            id: dbId, // Use the DB-generated ID
          });
        }
      }

      // Update local state with contacts that have correct DB IDs
      setCards((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        return [...updated, ...savedContacts];
      });

    } catch (error) {
      console.error("Processing failed for", file.name, error);
      setCards((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
              ...c,
              status: "failed",
              notes: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            }
            : c
        )
      );
    }
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    const newCards: BusinessCardData[] = files.map((file) => ({
      id: crypto.randomUUID(),
      source_filename: file.name,
      status: "pending",
      full_name: null,
      first_name: null,
      last_name: null,
      email: null,
      phone: null,
      company: null,
      title: null,
      website: null,
      address: null,
      notes: null,
      user_notes: null,
      confidence_score: 0,
    }));

    setCards((prev) => [...prev, ...newCards]);

    newCards.forEach((card, index) => {
      const file = files[index];
      limit(() => processFile(file, card.id));
    });
  }, [pocName]);

  const handleUpdate = async (id: string, field: keyof BusinessCardData, value: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

    // Also update in database
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (error) {
      console.error("Failed to update in DB:", error);
    }
  };

  const handleRemove = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));

    // Also delete from database
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete from DB:", error);
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear ALL contacts from the database? This affects everyone in your organization.")) {
      try {
        const response = await fetch("/api/contacts/clear", { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Failed to clear database");
        }
        setCards([]);
      } catch (error) {
        console.error("Failed to clear:", error);
        alert("Failed to clear contacts from database");
      }
    }
  };

  const processingCount = cards.filter(c => c.status === 'processing').length;
  const doneCount = cards.filter(c => c.status === 'done').length;

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Liquid Card Extractor
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Shared contact database for your organization.
          Upload business cards and all team members can see and export the combined list.
        </p>
      </div>

      {/* POC Input */}
      <GlassPanel className="p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-500" />
          {confirmedPoc ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ {confirmedPoc}
              </span>
              <button
                onClick={() => {
                  setConfirmedPoc("");
                  setPocName(confirmedPoc);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
              >
                Change
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={pocName}
              onChange={(e) => setPocName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pocName.trim()) {
                  setConfirmedPoc(pocName.trim());
                }
              }}
              placeholder="Enter your name, press Enter to confirm"
              className="bg-transparent flex-1 focus:outline-none text-sm placeholder-gray-400"
            />
          )}
        </div>
      </GlassPanel>

      <UploadZone onFilesSelected={handleFilesSelected} />

      {/* Stats bar */}
      <div className="flex justify-center gap-4 text-sm text-gray-500">
        <span>{doneCount} contacts in database</span>
        <button
          onClick={loadContacts}
          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : cards.length > 0 ? (
        <ResultsTable
          data={cards}
          pocName={confirmedPoc}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
        />
      ) : null}

      <div className="fixed bottom-4 right-4 flex gap-4 text-xs text-gray-400">
        {processingCount > 0 && (
          <span className="flex items-center gap-2 bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full shadow-lg backdrop-blur">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing {processingCount}...
          </span>
        )}
      </div>
    </main>
  );
}
