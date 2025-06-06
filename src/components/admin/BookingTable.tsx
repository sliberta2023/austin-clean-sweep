"use client";

import React, { useState, useMemo, startTransition } from "react";
import type { Booking } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, CalendarCheck, CheckCircle, Clock, XCircle, Search, Filter } from "lucide-react";
import { updateBookingStatus, deleteBookingAction } from "@/actions/bookingActions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingTableProps {
  bookings: Booking[];
}

const statusColors: Record<Booking["status"], string> = {
  pending: "bg-yellow-400/80 hover:bg-yellow-400 text-yellow-800",
  confirmed: "bg-green-500/80 hover:bg-green-500 text-green-800",
  completed: "bg-blue-500/80 hover:bg-blue-500 text-blue-800",
  cancelled: "bg-red-500/80 hover:bg-red-500 text-red-800",
};

export default function BookingTable({ bookings: initialBookings }: BookingTableProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: Booking["status"]) => {
    const result = await updateBookingStatus(id, status);
    if (result.success) {
      toast({ title: "Status Updated", description: `Booking ${id} marked as ${status}.` });
      // Optimistically update UI or refetch if revalidatePath is not sufficient
      setBookings(prev => prev.map(b => b.id === id ? {...b, status: status, updatedAt: new Date() as any} : b));
    } else {
      toast({ title: "Update Failed", description: result.error, variant: "destructive" });
    }
  };
  
  const openDeleteDialog = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setShowDeleteDialog(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    const result = await deleteBookingAction(bookingToDelete);
    if (result.success) {
      toast({ title: "Booking Deleted", description: `Booking ${bookingToDelete} has been deleted.` });
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete));
    } else {
      toast({ title: "Deletion Failed", description: result.error, variant: "destructive" });
    }
    setShowDeleteDialog(false);
    setBookingToDelete(null);
  };


  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = filterStatus === "all" || booking.status === filterStatus;
      const dateMatch = !filterDate || booking.serviceDate === filterDate;
      const searchTermMatch = 
        !searchTerm ||
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.id && booking.id.toLowerCase().includes(searchTerm.toLowerCase()));
      return statusMatch && dateMatch && searchTermMatch;
    });
  }, [bookings, filterStatus, filterDate, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
        <Select value={filterStatus} onValueChange={(value) => startTransition(() => setFilterStatus(value))}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => startTransition(() => setFilterDate(e.target.value))}
          className="w-full md:w-auto"
        />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Quote</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium truncate max-w-[80px]">{booking.id}</TableCell>
                <TableCell>
                  <div>{booking.name}</div>
                  <div className="text-xs text-muted-foreground">{booking.email}</div>
                </TableCell>
                <TableCell>
                  {booking.serviceType} ({booking.bedrooms}B/{booking.bathrooms}Ba)
                  {booking.addOns && booking.addOns.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      + {booking.addOns.join(", ")}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.serviceDate), "MMM dd, yyyy")}
                  {booking.serviceTime && (
                    <span className="text-xs text-muted-foreground"> @ {booking.serviceTime}</span>
                  )}
                </TableCell>
                <TableCell>${booking.quote.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[booking.status]}`}>{booking.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id!, "confirmed")}>
                        <CalendarCheck className="mr-2 h-4 w-4" /> Mark Confirmed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id!, "completed")}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id!, "pending")}>
                        <Clock className="mr-2 h-4 w-4" /> Mark Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id!, "cancelled")}>
                        <XCircle className="mr-2 h-4 w-4" /> Mark Cancelled
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(booking.id!)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No bookings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
