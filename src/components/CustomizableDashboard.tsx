"use client";

import React, { useState, useEffect, useCallback } from "react";
import GridLayout from "./Dashboard/GridLayout";
import "react-grid-layout-next/css/styles.css";
import "react-resizable/css/styles.css";
import { useAppContext } from "../context/AppContext";
import { Button } from "./ui/button";
import { Loader2, Save, Plus } from "lucide-react";
import Widget from "./Dashboard/Widget";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

interface WidgetConfig {
  id: string;
  type: "kpi" | "bar" | "line" | "pie";
  metric: string;
  title: string;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const CustomizableDashboard: React.FC = () => {
  const { state } = useAppContext();
  const userId = state.user?.id || "default";

  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboards?userId=${userId}`);
      if (res.ok) {
        const config = await res.json();
        setWidgets(config.data.widgets || []);
        setLayout(config.data.layout || []);
        await loadData(config.data.widgets || []);
      } else {
        // Handle no config found, set default
        setWidgets([]);
        setLayout([]);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadConfig();
    }
  }, [userId, loadConfig]);

  const loadData = async (widgetsToLoad: WidgetConfig[]) => {
    const newData: Record<string, any> = {};
    for (const widget of widgetsToLoad) {
      try {
        const res = await fetch(`/api/analytics/${widget.metric}`);
        const metricData = await res.json();
        newData[widget.id] = metricData.data;
      } catch (error) {
        console.error(`Failed to load data for ${widget.metric}:`, error);
      }
    }
    setData(newData);
  };

  const onLayoutChange = (newLayout: LayoutItem[]) => {
    // Avoid saving layout changes on every minor adjustment.
    // This could be enhanced with a debounce function.
    setLayout(newLayout);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/dashboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, widgets, layout }),
      });
    } catch (error) {
      console.error("Failed to save config:", error);
    }
    setIsSaving(false);
  };

  const addWidget = (type: WidgetConfig["type"], metric: string, title: string) => {
    const newId = Date.now().toString();
    const newWidget: WidgetConfig = { id: newId, type, metric, title };
    const newLayoutItem: LayoutItem = { i: newId, x: 0, y: Infinity, w: 4, h: 4 };

    setWidgets([...widgets, newWidget]);
    setLayout([...layout, newLayoutItem]);
    setIsAddWidgetDialogOpen(false);
  };
  
  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    setLayout(layout.filter(l => l.i !== widgetId));
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customizable Dashboard</h1>
        <div className="flex items-center gap-2">
          <AddWidgetDialog onAddWidget={addWidget} />
          <Button onClick={saveConfig} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Save className="mr-2" />
            )}
            Save Layout
          </Button>
        </div>
      </div>
      <GridLayout layouts={{ lg: layout }} onLayoutChange={onLayoutChange}>
        {widgets.map((widget) => (
          <div key={widget.id}>
            <Widget widget={widget} data={data[widget.id]} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

const AddWidgetDialog: React.FC<{ onAddWidget: Function }> = ({ onAddWidget }) => {
  const [type, setType] = useState<WidgetConfig["type"]>("bar");
  const [metric, setMetric] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (metric && title) {
      onAddWidget(type, metric, title);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Widget Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select onValueChange={(value) => setType(value as any)} defaultValue={type}>
            <SelectTrigger>
              <SelectValue placeholder="Widget Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Data Metric (e.g., sales, users)"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          />
          <Button onClick={handleSubmit}>Add Widget</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizableDashboard;