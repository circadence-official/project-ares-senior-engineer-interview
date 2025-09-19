# shadcn/ui Component Research for Task Management Application

## Installation Commands

To install all required components for the task management application:

```bash
npx shadcn@latest add @shadcn/button @shadcn/card @shadcn/input @shadcn/form @shadcn/table @shadcn/badge @shadcn/dialog @shadcn/sheet @shadcn/select @shadcn/sidebar @shadcn/dropdown-menu @shadcn/login-01 @shadcn/card-with-form @shadcn/dashboard-01 @shadcn/sidebar-01 @shadcn/alert @shadcn/skeleton @shadcn/sonner
```

## Core UI Components

### 1. Button Component

**Purpose**: Primary actions, form submissions, navigation
**Dependencies**: `@radix-ui/react-slot`

**Key Features**:
- Multiple variants: default, secondary, destructive, outline, ghost, link
- Size options: default, sm, lg, icon
- Asynchronous action support
- Keyboard navigation
- ARIA accessibility

**Basic Usage**:
```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button>Submit Task</Button>

// Secondary actions
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Edit</Button>

// Icon button
<Button size="icon" variant="ghost">
  <PlusIcon />
</Button>
```

**Task Management Integration**:
- Create task buttons
- Form submission buttons
- Action buttons in dropdowns
- Navigation buttons

### 2. Card Component

**Purpose**: Task cards, stats widgets, content containers
**Dependencies**: None

**Key Features**:
- Flexible layout with header, content, footer, action sections
- Built-in spacing and typography
- Perfect for displaying tasks and statistics
- Responsive design

**Basic Usage**:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Task Title</CardTitle>
    <CardDescription>Task description and metadata</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">
        <MoreVertical />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Task details and content</p>
  </CardContent>
  <CardFooter>
    <Badge variant="secondary">Priority: High</Badge>
  </CardFooter>
</Card>
```

**Task Management Integration**:
- Individual task cards in grid/list view
- Dashboard statistics cards
- Form containers
- Mobile-first task display

### 3. Input Component

**Purpose**: Text inputs for forms and search
**Dependencies**: None

**Key Features**:
- Consistent styling with focus states
- Error state support
- Placeholder text
- Full accessibility support
- Works with React Hook Form

**Basic Usage**:
```tsx
import { Input } from "@/components/ui/input"

<Input 
  type="text" 
  placeholder="Enter task title..."
  value={value}
  onChange={onChange}
/>
```

**Task Management Integration**:
- Task title and description inputs
- Search functionality
- Filter inputs
- User registration/login forms

### 4. Form Component

**Purpose**: Form handling with validation
**Dependencies**: `@radix-ui/react-label`, `@radix-ui/react-slot`, `@hookform/resolvers`, `zod`, `react-hook-form`

**Key Features**:
- Built-in React Hook Form integration
- Zod schema validation
- Automatic error handling
- Field-level validation
- Accessible form controls

**TanStack Form Integration**:
```tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'completed'])
})

const TaskForm = () => {
  const form = useForm({
    defaultValues: { title: '', description: '', priority: 'medium', status: 'pending' },
    validators: {
      onChange: taskSchema
    },
    onSubmit: async ({ value }) => {
      // Submit task
    }
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="title">
        {(field) => (
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors && (
              <p className="text-red-500 text-sm">{field.state.meta.errors}</p>
            )}
          </div>
        )}
      </form.Field>
    </form>
  )
}
```

### 5. Table Component

**Purpose**: Task lists and data tables
**Dependencies**: None

**Key Features**:
- Semantic table structure
- Responsive design
- Caption support
- Sortable headers
- Row selection

**Advanced Data Table (TanStack Table Integration)**:
```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const TaskTable = ({ data }) => {
  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('status')}</Badge>
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('priority')}</Badge>
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 6. Badge Component

**Purpose**: Status and priority indicators
**Dependencies**: `@radix-ui/react-slot`

**Key Features**:
- Multiple variants: default, secondary, destructive, outline
- Icon support
- Consistent sizing
- Accessible labels

**Basic Usage**:
```tsx
import { Badge } from "@/components/ui/badge"

// Status indicators
<Badge variant="default">Completed</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>

// Priority indicators
<Badge variant="outline">High Priority</Badge>

// With icons
<Badge variant="secondary">
  <CheckIcon className="w-3 h-3 mr-1" />
  Completed
</Badge>
```

**Task Management Integration**:
- Task status display
- Priority indicators
- Category tags
- Count indicators

### 7. Dialog Component

**Purpose**: Task creation/editing modals
**Dependencies**: `@radix-ui/react-dialog`

**Key Features**:
- Modal overlay with focus trap
- Keyboard navigation (ESC to close)
- Customizable positioning
- Accessible labels and descriptions
- Form integration

**Task Creation Modal**:
```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Create New Task</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogDescription>
        Add a new task to your list. Fill in the details below.
      </DialogDescription>
    </DialogHeader>
    <TaskForm />
    <DialogFooter>
      <Button type="submit">Create Task</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 8. Sheet Component

**Purpose**: Mobile-friendly side panels
**Dependencies**: `@radix-ui/react-dialog`

**Key Features**:
- Slide-in panels from any direction
- Mobile-optimized design
- Backdrop overlay
- Keyboard navigation
- Perfect for mobile task details

**Mobile Task Details Panel**:
```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost">View Details</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Task Details</SheetTitle>
      <SheetDescription>View and edit task information</SheetDescription>
    </SheetHeader>
    <TaskDetailsForm />
  </SheetContent>
</Sheet>
```

### 9. Select Component

**Purpose**: Priority and status dropdowns
**Dependencies**: `@radix-ui/react-select`

**Key Features**:
- Keyboard navigation
- Search functionality
- Grouping support
- Custom styling
- Form integration

**Priority/Status Selection**:
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select value={priority} onValueChange={setPriority}>
  <SelectTrigger>
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low Priority</SelectItem>
    <SelectItem value="medium">Medium Priority</SelectItem>
    <SelectItem value="high">High Priority</SelectItem>
  </SelectContent>
</Select>
```

### 10. Sidebar Component

**Purpose**: Main navigation and layout
**Dependencies**: `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react`

**Key Features**:
- Collapsible design
- Mobile responsive
- Navigation grouping
- User profile integration
- Icon support

**Application Sidebar**:
```tsx
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const AppSidebar = () => (
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard">
                  <HomeIcon />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/tasks">
                  <TaskIcon />
                  <span>Tasks</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
)
```

### 11. Dropdown Menu Component

**Purpose**: User menus and actions
**Dependencies**: `@radix-ui/react-dropdown-menu`

**Key Features**:
- Keyboard navigation
- Submenu support
- Separators and labels
- Checkbox items
- Destructive actions

**User Action Menu**:
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Edit Task</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">Delete Task</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Authentication Components

### 1. Login-01 Block

**Purpose**: Simple login form layout
**Type**: Block component (pre-built page template)
**Files**: 2 files (page and form component)

**Key Features**:
- Clean, modern design
- Email/password fields
- "Forgot password" link
- Social login option
- Registration link
- Responsive layout

**Implementation**:
```tsx
import { LoginForm } from "@/components/blocks/login-01/login-form"

const LoginPage = () => (
  <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="w-full max-w-sm">
      <LoginForm />
    </div>
  </div>
)
```

**TanStack Integration**:
- Can be easily integrated with TanStack Form for validation
- Works with TanStack Router for navigation
- Compatible with TanStack Query for auth mutations

### 2. Card-with-Form Component

**Purpose**: Registration and auth forms
**Type**: Example component

**Key Features**:
- Card-based form layout
- Input and select combinations
- Action buttons in footer
- Flexible form structure

**Registration Form Adaptation**:
```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="w-[400px]">
  <CardHeader>
    <CardTitle>Create Account</CardTitle>
    <CardDescription>Join us to manage your tasks efficiently</CardDescription>
  </CardHeader>
  <CardContent>
    <RegistrationForm />
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Back to Login</Button>
    <Button type="submit">Create Account</Button>
  </CardFooter>
</Card>
```

## Layout & Navigation Components

### 1. Dashboard-01 Block

**Purpose**: Main dashboard layout with sidebar
**Type**: Block component (complete dashboard template)
**Files**: 11 files (comprehensive dashboard system)
**Dependencies**: `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@tanstack/react-table`, `zod`, `@tabler/icons-react`

**Key Features**:
- Complete dashboard layout with sidebar
- Interactive charts and data visualizations
- Advanced data table with drag-and-drop
- Responsive design with container queries
- Built-in TanStack Table integration
- Modern component architecture

**Integration Notes**:
- Perfect foundation for task management dashboard
- Already includes TanStack Table implementation
- Drag-and-drop task reordering
- Customizable sidebar navigation
- Chart components for task analytics

**Adaptation for Task Management**:
```tsx
// Replace chart data with task statistics
// Customize sidebar navigation for task categories
// Adapt data table columns for task properties
// Integrate with task API endpoints
```

### 2. Sidebar-01 Block

**Purpose**: Simple navigation sidebar
**Type**: Block component
**Files**: 4 files (sidebar system)

**Key Features**:
- Grouped navigation sections
- Search functionality
- Version/project switcher
- Collapsible design
- Clean, minimal interface

**Task Management Navigation**:
```tsx
const taskNavigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "All Tasks", url: "/tasks" },
    ]
  },
  {
    title: "Manage",
    items: [
      { title: "Create Task", url: "/tasks/new" },
      { title: "Categories", url: "/categories" },
      { title: "Archive", url: "/archive" },
    ]
  },
  {
    title: "Account",
    items: [
      { title: "Profile", url: "/profile" },
      { title: "Settings", url: "/settings" },
    ]
  }
]
```

### 3. Data-Table-Demo Component

**Purpose**: Advanced table with sorting/filtering
**Already included in Dashboard-01 block**

**Key Features**:
- Column sorting and filtering
- Row selection with checkboxes
- Pagination controls
- Column visibility toggle
- Search functionality
- Responsive design

**TanStack Query Integration**:
```tsx
import { useQuery } from '@tanstack/react-query'

const TaskDataTable = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  })

  if (isLoading) return <TableSkeleton />
  
  return <DataTable data={tasks} columns={taskColumns} />
}
```

## Feedback Components

### 1. Sonner (Toast) Component

**Purpose**: Success/error notifications
**Dependencies**: `sonner`, `next-themes`

**Key Features**:
- Multiple toast types (success, error, info)
- Action buttons in toasts
- Automatic dismissal
- Positioning options
- Promise-based toasts
- Theme integration

**Task Management Integration**:
```tsx
import { toast } from 'sonner'

// Success notification
const handleTaskCreate = async (taskData) => {
  toast.promise(createTask(taskData), {
    loading: 'Creating task...',
    success: 'Task created successfully!',
    error: 'Failed to create task'
  })
}

// Action toast
const handleTaskComplete = (taskId) => {
  toast.success('Task completed!', {
    action: {
      label: 'Undo',
      onClick: () => undoTaskCompletion(taskId)
    }
  })
}
```

### 2. Alert Component

**Purpose**: Important messages
**Dependencies**: None

**Key Features**:
- Multiple variants (default, destructive)
- Icon support
- Title and description structure
- Accessible markup

**Error Handling**:
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// API Error Display
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load tasks. Please try again.
  </AlertDescription>
</Alert>

// Success Message
<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    All tasks have been synced successfully.
  </AlertDescription>
</Alert>
```

### 3. Skeleton Component

**Purpose**: Loading states
**Dependencies**: None

**Key Features**:
- Customizable dimensions
- Animation built-in
- Multiple shapes (rectangular, circular)
- Responsive design

**Loading States**:
```tsx
import { Skeleton } from "@/components/ui/skeleton"

const TaskListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))}
  </div>
)
```

## TanStack Ecosystem Integration Patterns

### TanStack Query Integration

**Optimistic Updates for Task Management**:
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useCreateTask = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks'])
      
      queryClient.setQueryData(['tasks'], old => [
        ...old,
        { ...newTask, id: 'temp-' + Date.now() }
      ])
      
      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(['tasks'], context.previousTasks)
      toast.error('Failed to create task')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}
```

### TanStack Router Integration

**Type-safe Navigation**:
```tsx
import { createRoute, createRouter } from '@tanstack/react-router'

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
  loader: () => queryClient.ensureQueryData({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  })
})

const taskRoute = createRoute({
  getParentRoute: () => tasksRoute,
  path: '/$taskId',
  component: TaskDetailPage,
  loader: ({ params }) => queryClient.ensureQueryData({
    queryKey: ['task', params.taskId],
    queryFn: () => fetchTask(params.taskId)
  })
})
```

### TanStack Form Integration

**Advanced Form Validation**:
```tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'

const TaskForm = () => {
  const createTaskMutation = useCreateTask()
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    },
    validators: {
      onChange: z.object({
        title: z.string().min(1, 'Title is required').max(255),
        description: z.string().max(1000).optional(),
        priority: z.enum(['low', 'medium', 'high']),
        dueDate: z.string().datetime().optional()
      })
    },
    onSubmit: async ({ value }) => {
      await createTaskMutation.mutateAsync(value)
    }
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      {/* Form fields */}
    </form>
  )
}
```

## Accessibility Features

All shadcn/ui components include:

- **Semantic HTML**: Proper heading hierarchy, landmarks, form labels
- **Keyboard Navigation**: Tab order, arrow keys, Enter/Space activation
- **Screen Reader Support**: ARIA labels, descriptions, live regions
- **Focus Management**: Visible focus indicators, focus trapping in modals
- **Color Contrast**: WCAG AA compliant color combinations

## Responsive Design Considerations

### Mobile-First Approach
- Components adapt to screen size automatically
- Touch-friendly interaction targets (minimum 44px)
- Gesture support where applicable

### Breakpoint Strategy
```tsx
// Tailwind CSS breakpoints used by components
sm: 640px   // Small devices
md: 768px   // Medium devices  
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
```

### Component-Specific Responsive Behavior
- **Tables**: Convert to cards on mobile
- **Sidebar**: Becomes overlay/sheet on small screens
- **Dialogs**: Full-screen on mobile
- **Cards**: Stack vertically on narrow screens

## Implementation Recommendations

### Phase 1: Core Setup
1. Install all components using the provided command
2. Set up TanStack Query with React Query DevTools
3. Configure TanStack Router with type-safe routes
4. Implement authentication flow with login-01 block

### Phase 2: Layout & Navigation
1. Implement dashboard-01 block as main application shell
2. Customize sidebar navigation for task management
3. Set up protected routes with authentication guards

### Phase 3: Task Management Features
1. Build task forms using TanStack Form + shadcn/ui form components
2. Implement task table with sorting, filtering, and pagination
3. Add task creation/editing dialogs
4. Integrate toast notifications for user feedback

### Phase 4: Polish & Optimization
1. Add loading states with skeleton components
2. Implement error boundaries with alert components
3. Add animations and micro-interactions
4. Optimize performance with React Query caching

This comprehensive research provides everything needed to implement a production-ready task management application using shadcn/ui components with the TanStack ecosystem.