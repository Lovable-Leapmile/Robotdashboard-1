import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "latest" | "task_asc" | "task_desc";

interface Task {
  task_id: string;
  last_updated?: string;
}

const FILTER_STORAGE_KEY = "camera_filter_preference";

const Camera = () => {
  useAuthSession(); // Session validation
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    return (saved as SortOption) || "latest";
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Filter to only show task IDs starting with TID- (exclude null/undefined)
    let tidTasks = tasks.filter((task) => task.task_id && task.task_id.startsWith("TID-"));
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      tidTasks = tidTasks.filter((task) =>
        task.task_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sortedTasks = [...tidTasks].sort((a, b) => {
      switch (sortOption) {
        case "task_asc":
          return a.task_id.localeCompare(b.task_id);
        case "task_desc":
          return b.task_id.localeCompare(a.task_id);
        case "latest":
        default:
          const dateA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
          const dateB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
          return dateB - dateA;
      }
    });

    setFilteredTasks(sortedTasks);
  }, [searchQuery, tasks, sortOption]);

  const handleSortChange = (value: string) => {
    const newSort = value as SortOption;
    setSortOption(newSort);
    localStorage.setItem(FILTER_STORAGE_KEY, newSort);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        "https://amsstores1.leapmile.com/cameramanager/camera_events/tasks",
        {
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.records) {
        setTasks(data.records);
        setFilteredTasks(data.records);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/camera/${taskId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isCameraPage={true} />
      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-[60%]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by Task ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-card border-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
                  style={{ backgroundColor: 'rgba(53, 28, 117, 0.15)' }}
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="h-[18px] w-[18px]" style={{ color: '#351C75' }} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortChange}>
                    <DropdownMenuRadioItem value="latest" className="cursor-pointer">
                      Latest Task
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="task_asc" className="cursor-pointer">
                      Task (ASC)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="task_desc" className="cursor-pointer">
                      Task (DESC)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-10 flex items-center justify-center px-3">
                <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                  Total: <span className="text-foreground font-semibold">{filteredTasks.length}</span>
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No tasks found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => handleTaskClick(task.task_id)}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-primary/5 hover:shadow-md hover:border-primary/30 transition-all duration-200 flex items-center justify-center min-h-[50px]"
                >
                  <span className="text-foreground font-medium truncate text-sm sm:text-base">
                    {task.task_id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Camera;
