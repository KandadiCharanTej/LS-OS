"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Edit3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useCRM } from "@/lib/store/crm-store";
import { Task, PriorityLevel, TaskStatus } from "@/types/crm";

export default function TasksPage() {
  const { tasks, clients, addTask, updateTask, toggleTaskStatus, deleteTask } =
    useCRM();

  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Task Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id || "client-kf-ai");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );

  // Edit Task State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("MEDIUM");
  const [editStatus, setEditStatus] = useState<TaskStatus>("TODO");
  const [editDueDate, setEditDueDate] = useState("");

  const handleOpenEditTask = (t: Task) => {
    setEditingTask(t);
    setEditTitle(t.title);
    setEditDescription(t.description || "");
    setEditClientId(t.client_id || "");
    setEditPriority(t.priority || "MEDIUM");
    setEditStatus(t.status || "TODO");
    setEditDueDate(t.due_date?.slice(0, 10) || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const client = clients.find((c) => c.id === editClientId);
    updateTask(editingTask.id, {
      title: editTitle,
      description: editDescription,
      client_id: editClientId,
      client_name: client?.name || editingTask.client_name,
      priority: editPriority,
      status: editStatus,
      due_date: editDueDate,
    });
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesClient =
      selectedClient === "ALL" || t.client_id === selectedClient;
    const matchesPriority =
      selectedPriority === "ALL" || t.priority === selectedPriority;
    return matchesClient && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTask({
      title,
      description,
      client_id: clientId,
      client_name: clients.find((c) => c.id === clientId)?.name || "Kinetic Flow AI",
      priority,
      status: "TODO",
      due_date: new Date(dueDate).toISOString(),
    });

    setIsAddModalOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#071525] tracking-tight">
              Operational Tasks & Follow-ups
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Internal SDR task assignments, follow-up deadlines, and account milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="bg-white border border-slate-200 rounded-full p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-full text-xs transition-colors ${
                  viewMode === "kanban"
                    ? "bg-[#071525] text-white"
                    : "text-slate-500 hover:text-[#071525]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-[#071525] text-white"
                    : "text-slate-500 hover:text-[#071525]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#071525]/[0.08] shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525]"
            >
              <option value="ALL">All Client Workspaces</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-slate-200 rounded-xl px-3 py-1.5 text-[#071525]"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredTasks.filter((t) => t.status !== "COMPLETED").length} open tasks
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: TODO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  To Do (
                  {filteredTasks.filter((t) => t.status === "TODO").length})
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>

              <div className="space-y-3">
                {filteredTasks
                  .filter((t) => t.status === "TODO")
                  .map((task) => (
                    <Card key={task.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-[10px] font-mono text-slate-400">
                          {task.client_name}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-[#071525] leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span className="font-mono">
                          Due {new Date(task.due_date || "").toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateTask(task.id, { status: "IN_PROGRESS" })}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-[#C65D2E] hover:text-white transition-colors"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="p-1 text-slate-400 hover:text-emerald-600"
                            title="Complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C65D2E] font-mono">
                  In Progress (
                  {filteredTasks.filter((t) => t.status === "IN_PROGRESS").length})
                </span>
                <span className="w-2 h-2 rounded-full bg-[#C65D2E]" />
              </div>

              <div className="space-y-3">
                {filteredTasks
                  .filter((t) => t.status === "IN_PROGRESS")
                  .map((task) => (
                    <Card key={task.id} className="p-4 space-y-3 border-l-4 border-l-[#C65D2E]">
                      <div className="flex items-start justify-between gap-2">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-[10px] font-mono text-slate-400">
                          {task.client_name}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs text-[#071525] leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span className="font-mono text-[#C65D2E]">
                          Due {new Date(task.due_date || "").toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-medium transition-colors"
                          >
                            Mark Done
                          </button>
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Completed (
                  {filteredTasks.filter((t) => t.status === "COMPLETED").length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>

              <div className="space-y-3">
                {filteredTasks
                  .filter((t) => t.status === "COMPLETED")
                  .map((task) => (
                    <Card key={task.id} className="p-4 space-y-2 opacity-75 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono line-through text-slate-400">
                          {task.client_name}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>

                      <h4 className="font-medium text-xs text-slate-600 line-through">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>Completed</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-400 hover:text-red-500"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 hover:border-[#C65D2E]"
                        }`}
                      >
                        {task.status === "COMPLETED" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div>
                        <span
                          className={`font-semibold ${
                            task.status === "COMPLETED"
                              ? "line-through text-slate-400"
                              : "text-[#071525]"
                          }`}
                        >
                          {task.title}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {task.client_name} • Assigned to {task.assigned_to_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <span className="font-mono text-slate-500 text-[11px]">
                        {new Date(task.due_date || "").toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="text-slate-400 hover:text-slate-700"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Task Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create Operational Task"
          description="Assign follow-up actions and outreach deliverables."
          maxWidth="md"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Follow up with Robert on SOC2 security brief"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Client Organization
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Description / Details
              </label>
              <textarea
                rows={3}
                placeholder="Include specific links or call preparation instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Task
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Task Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          title={`Edit Task: ${editingTask?.title || "Task Details"}`}
          description="Update task details, priority, status, and due dates."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Client Account
                </label>
                <select
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="">No Client Linked</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071525] mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071525] mb-1">
                Description / Context
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

