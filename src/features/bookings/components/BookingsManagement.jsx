import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';
import api from '../../../services/api';

const STATUS_OPTIONS = [
  'CREATED',
  'PENDING_PAYMENT',
  'MATCHING',
  'ASSIGNED',
  'ACCEPTED',
  'PICKUP',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const FORCE_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (status) => !['IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)
);

const VEHICLE_OPTIONS = ['BIKE', 'CAR4', 'CAR7'];
const PAYMENT_OPTIONS = ['CASH', 'MOMO', 'VNPAY', 'ZALOPAY', 'STRIPE', 'WALLET'];

const STATUS_META = {
  CREATED: { label: 'Created', className: 'bg-slate-100 text-slate-700' },
  PENDING_PAYMENT: { label: 'Pending payment', className: 'bg-amber-100 text-amber-700' },
  MATCHING: { label: 'Matching', className: 'bg-sky-100 text-sky-700' },
  ASSIGNED: { label: 'Assigned', className: 'bg-indigo-100 text-indigo-700' },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700' },
  PICKUP: { label: 'Pickup', className: 'bg-cyan-100 text-cyan-700' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-violet-100 text-violet-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' },
};

const VEHICLE_LABELS = {
  BIKE: 'Bike',
  CAR4: 'Car 4',
  CAR7: 'Car 7',
};

const PAYMENT_LABELS = {
  CASH: 'Cash',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
  STRIPE: 'Stripe',
  WALLET: 'Wallet',
};

const EMPTY_FILTERS = {
  status: '',
  customerId: '',
  driverId: '',
  paymentMethod: '',
  vehicleType: '',
  createdFrom: '',
  createdTo: '',
};

const emptyActionState = {
  cancelReason: '',
  forceStatus: 'MATCHING',
  forceReason: '',
};

const formatCurrency = (value) => {
  if (value == null || value === '') return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toStartOfDayIso = (value) => {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`).toISOString();
};

const toEndOfDayIso = (value) => {
  if (!value) return undefined;
  return new Date(`${value}T23:59:59.999`).toISOString();
};

const getStatusMeta = (status) =>
  STATUS_META[status] || { label: status || '-', className: 'bg-slate-100 text-slate-700' };

const buildPagination = (page, totalPages) => {
  if (totalPages <= 0) return [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  return Array.from({ length: end - start }, (_, index) => start + index);
};

const SummaryCard = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-surface border border-border-light rounded-xl p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      </div>
      <div className={`rounded-xl border p-2.5 ${tone}`}>
        <Icon size={16} strokeWidth={1.75} />
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
    <p className="text-sm text-text-primary break-words">{value || '-'}</p>
  </div>
);

const DetailModal = ({
  booking,
  timeline,
  loading,
  onClose,
  actionState,
  setActionState,
  onCancelBooking,
  onRetryMatching,
  onForceStatus,
  actionLoading,
  detailError,
}) => {
  const statusMeta = getStatusMeta(booking?.status);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-border-light bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Booking detail</p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">
              {booking?.bookingId || 'Loading booking'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-light px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-81px)] grid-cols-1 overflow-y-auto xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6 p-6">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-text-muted">
                <LoaderCircle size={18} className="mr-2 animate-spin" />
                Loading booking detail...
              </div>
            ) : detailError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {detailError}
              </div>
            ) : booking ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                  <span className="text-sm text-text-muted">
                    Updated {formatDateTime(booking.updatedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <InfoRow label="Customer ID" value={booking.customerId} />
                  <InfoRow label="Driver ID" value={booking.driverId} />
                  <InfoRow label="Estimated fare" value={formatCurrency(booking.estimatedFare)} />
                  <InfoRow label="Vehicle type" value={VEHICLE_LABELS[booking.vehicleType] || booking.vehicleType} />
                  <InfoRow label="Payment method" value={PAYMENT_LABELS[booking.paymentMethod] || booking.paymentMethod} />
                  <InfoRow label="Promo code" value={booking.promoCode} />
                  <InfoRow label="Estimate ID" value={booking.estimateId} />
                  <InfoRow label="Quote ID" value={booking.quoteId} />
                  <InfoRow label="Quote expires" value={formatDateTime(booking.quoteExpiresAt)} />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border-light p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <MapPin size={15} className="text-accent-primary" />
                      <h3 className="text-sm font-semibold text-text-primary">Trip information</h3>
                    </div>
                    <div className="space-y-4">
                      <InfoRow label="Pickup" value={booking.pickupLocation} />
                      <InfoRow label="Dropoff" value={booking.dropoffLocation} />
                      <InfoRow
                        label="Pickup coordinates"
                        value={
                          booking.pickupCoordinates
                            ? `${booking.pickupCoordinates.lat}, ${booking.pickupCoordinates.lng}`
                            : '-'
                        }
                      />
                      <InfoRow
                        label="Dropoff coordinates"
                        value={
                          booking.dropoffCoordinates
                            ? `${booking.dropoffCoordinates.lat}, ${booking.dropoffCoordinates.lng}`
                            : '-'
                        }
                      />
                      <InfoRow label="Customer note" value={booking.customerNote} />
                      <InfoRow label="Created at" value={formatDateTime(booking.createdAt)} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-light p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <User size={15} className="text-status-info" />
                      <h3 className="text-sm font-semibold text-text-primary">User snapshot</h3>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Customer</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <InfoRow label="Full name" value={booking.customerInfo?.fullName} />
                          <InfoRow label="Phone" value={booking.customerInfo?.phone} />
                          <InfoRow label="Email" value={booking.customerInfo?.email} />
                          <InfoRow label="User ID" value={booking.customerInfo?.userId} />
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Driver</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <InfoRow label="Full name" value={booking.driverInfo?.fullName} />
                          <InfoRow label="Phone" value={booking.driverInfo?.phone} />
                          <InfoRow label="Email" value={booking.driverInfo?.email} />
                          <InfoRow label="User ID" value={booking.driverInfo?.userId} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border-light p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldAlert size={15} className="text-status-warning" />
                    <h3 className="text-sm font-semibold text-text-primary">Admin timeline</h3>
                  </div>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-text-muted">No admin actions recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {timeline.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border-light bg-surface-elevated/40 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">{item.action}</span>
                            <span className="text-xs text-text-muted">{formatDateTime(item.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm text-text-secondary">
                            {item.oldStatus || '-'} to {item.newStatus || '-'}
                          </p>
                          {item.reason && <p className="mt-1 text-sm text-text-secondary">{item.reason}</p>}
                          <p className="mt-1 text-xs text-text-muted">Admin: {item.adminId || '-'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          <div className="border-l border-border-light bg-surface-elevated/35 p-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border-light bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <RotateCcw size={15} className="text-accent-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Retry matching</h3>
                </div>
                <p className="mb-4 text-sm text-text-secondary">
                  Re-open matching for bookings that are stuck in matching or assigned state.
                </p>
                <button
                  type="button"
                  disabled={actionLoading === 'retry' || loading || !booking}
                  onClick={onRetryMatching}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === 'retry' && <LoaderCircle size={14} className="animate-spin" />}
                  Retry matching
                </button>
              </div>

              <div className="rounded-2xl border border-border-light bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle size={15} className="text-status-warning" />
                  <h3 className="text-sm font-semibold text-text-primary">Force status</h3>
                </div>
                <div className="space-y-3">
                  <select
                    value={actionState.forceStatus}
                    onChange={(event) => setActionState((prev) => ({ ...prev, forceStatus: event.target.value }))}
                    className="w-full rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
                  >
                    {FORCE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {getStatusMeta(status).label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={actionState.forceReason}
                    onChange={(event) => setActionState((prev) => ({ ...prev, forceReason: event.target.value }))}
                    rows={4}
                    placeholder="Reason for forced status update"
                    className="w-full rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
                  />
                  <button
                    type="button"
                    disabled={actionLoading === 'status' || loading || !booking}
                    onClick={onForceStatus}
                    className="inline-flex items-center gap-2 rounded-xl bg-status-warning px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-status-warning/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === 'status' && <LoaderCircle size={14} className="animate-spin" />}
                    Update status
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <XCircle size={15} className="text-rose-600" />
                  <h3 className="text-sm font-semibold text-text-primary">Cancel booking</h3>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={actionState.cancelReason}
                    onChange={(event) => setActionState((prev) => ({ ...prev, cancelReason: event.target.value }))}
                    rows={4}
                    placeholder="Reason for admin cancellation"
                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    disabled={actionLoading === 'cancel' || loading || !booking}
                    onClick={onCancelBooking}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === 'cancel' && <LoaderCircle size={14} className="animate-spin" />}
                    Cancel booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsManagement = () => {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [actionState, setActionState] = useState(emptyActionState);
  const [actionLoading, setActionLoading] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
      };
      if (filters.status) params.status = filters.status;
      if (filters.customerId) params.customerId = filters.customerId.trim();
      if (filters.driverId) params.driverId = filters.driverId.trim();
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.createdFrom) params.createdFrom = toStartOfDayIso(filters.createdFrom);
      if (filters.createdTo) params.createdTo = toEndOfDayIso(filters.createdTo);

      const response = await api.get('/api/admin/bookings', { params });
      const result = response.data?.result || {};
      setBookings(result.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: result.totalPages || 0,
        totalElements: result.totalElements || 0,
      }));
    } catch (err) {
      setBookings([]);
      setError(err.response?.data?.message || 'Could not load admin bookings.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  const fetchBookingDetail = useCallback(async (bookingId) => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const [detailResponse, timelineResponse] = await Promise.all([
        api.get(`/api/admin/bookings/${bookingId}`),
        api.get(`/api/admin/bookings/${bookingId}/timeline`),
      ]);
      setSelectedBooking(detailResponse.data?.result || null);
      setTimeline(timelineResponse.data?.result || []);
      setActionState((prev) => ({
        ...prev,
        forceStatus: detailResponse.data?.result?.status || 'MATCHING',
      }));
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not load booking detail.');
      setSelectedBooking(null);
      setTimeline([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (!selectedBookingId) return undefined;
    fetchBookingDetail(selectedBookingId);
    return undefined;
  }, [fetchBookingDetail, selectedBookingId]);

  const summary = useMemo(() => {
    const activeCount = bookings.filter((booking) => !['COMPLETED', 'CANCELLED'].includes(booking.status)).length;
    const matchingCount = bookings.filter((booking) => booking.status === 'MATCHING').length;
    const completedCount = bookings.filter((booking) => booking.status === 'COMPLETED').length;
    return { activeCount, matchingCount, completedCount };
  }, [bookings]);

  const pageNumbers = useMemo(
    () => buildPagination(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages]
  );

  const submitFilters = (event) => {
    event.preventDefault();
    setPagination((prev) => ({ ...prev, page: 0 }));
    setFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const openDetail = (bookingId) => {
    setSelectedBookingId(bookingId);
    setSelectedBooking(null);
    setTimeline([]);
    setDetailError('');
    setActionState(emptyActionState);
  };

  const closeDetail = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    setTimeline([]);
    setDetailError('');
    setActionState(emptyActionState);
    setActionLoading('');
  };

  const refreshAfterAction = async (bookingId) => {
    await Promise.all([fetchBookings(), fetchBookingDetail(bookingId)]);
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return;
    const reason = actionState.cancelReason.trim();
    if (!reason) {
      setDetailError('Cancellation reason is required.');
      return;
    }
    setActionLoading('cancel');
    setDetailError('');
    try {
      await api.post(`/api/admin/bookings/${selectedBookingId}/cancel`, { reason });
      await refreshAfterAction(selectedBookingId);
      setActionState((prev) => ({ ...prev, cancelReason: '' }));
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRetryMatching = async () => {
    if (!selectedBookingId) return;
    setActionLoading('retry');
    setDetailError('');
    try {
      await api.post(`/api/admin/bookings/${selectedBookingId}/retry-matching`);
      await refreshAfterAction(selectedBookingId);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not retry matching.');
    } finally {
      setActionLoading('');
    }
  };

  const handleForceStatus = async () => {
    if (!selectedBookingId) return;
    const reason = actionState.forceReason.trim();
    if (!reason) {
      setDetailError('Reason is required for force status.');
      return;
    }
    setActionLoading('status');
    setDetailError('');
    try {
      await api.patch(`/api/admin/bookings/${selectedBookingId}/status`, {
        status: actionState.forceStatus,
        reason,
      });
      await refreshAfterAction(selectedBookingId);
      setActionState((prev) => ({ ...prev, forceReason: '' }));
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not update booking status.');
    } finally {
      setActionLoading('');
    }
  };

  const showingFrom = bookings.length === 0 ? 0 : pagination.page * pagination.size + 1;
  const showingTo = bookings.length === 0
    ? 0
    : Math.min((pagination.page + 1) * pagination.size, pagination.totalElements);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={CarFront}
          label="Loaded bookings"
          value={pagination.totalElements}
          tone="border-sky-200 bg-sky-50 text-sky-700"
        />
        <SummaryCard
          icon={RefreshCw}
          label="Active in page"
          value={summary.activeCount}
          tone="border-amber-200 bg-amber-50 text-amber-700"
        />
        <SummaryCard
          icon={ShieldAlert}
          label="Matching in page"
          value={summary.matchingCount}
          tone="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
      </div>

      <form onSubmit={submitFilters} className="rounded-2xl border border-border-light bg-surface p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Booking operations</h2>
            <p className="text-sm text-text-muted">Search, inspect and operate bookings from the admin portal.</p>
          </div>
          <button
            type="button"
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 rounded-xl border border-border-light px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {getStatusMeta(status).label}
              </option>
            ))}
          </select>

          <input
            value={draftFilters.customerId}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, customerId: event.target.value }))}
            placeholder="Customer ID"
            className="rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
          />

          <input
            value={draftFilters.driverId}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, driverId: event.target.value }))}
            placeholder="Driver ID"
            className="rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
          />

          <select
            value={draftFilters.paymentMethod}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, paymentMethod: event.target.value }))}
            className="rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
          >
            <option value="">All payment methods</option>
            {PAYMENT_OPTIONS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_LABELS[method] || method}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.vehicleType}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, vehicleType: event.target.value }))}
            className="rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
          >
            <option value="">All vehicle types</option>
            {VEHICLE_OPTIONS.map((vehicle) => (
              <option key={vehicle} value={vehicle}>
                {VEHICLE_LABELS[vehicle]}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary">
            <Calendar size={14} className="text-text-muted" />
            <input
              type="date"
              value={draftFilters.createdFrom}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, createdFrom: event.target.value }))}
              className="w-full bg-transparent outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary">
            <Calendar size={14} className="text-text-muted" />
            <input
              type="date"
              value={draftFilters.createdTo}
              onChange={(event) => setDraftFilters((prev) => ({ ...prev, createdTo: event.target.value }))}
              className="w-full bg-transparent outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <Search size={14} />
            Apply filters
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-border-light px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            Reset
          </button>
          <span className="text-sm text-text-muted">
            Completed in page: <span className="font-semibold text-text-secondary">{summary.completedCount}</span>
          </span>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border-light bg-surface">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Booking list</h3>
            <p className="text-xs text-text-muted">{pagination.totalElements} bookings found</p>
          </div>
        </div>

        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead>
              <tr className="bg-surface-elevated text-left">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Booking</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Customer / Driver</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Route</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Type</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Fare</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Updated</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-t border-border-light">
                    <td className="px-5 py-4"><div className="h-4 w-40 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-48 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-56 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-24 animate-pulse rounded-full bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" /></td>
                    <td className="px-5 py-4"><div className="ml-auto h-9 w-24 animate-pulse rounded-xl bg-surface-elevated" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-sm text-text-muted">
                    No bookings matched the current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const statusMeta = getStatusMeta(booking.status);
                  return (
                    <tr key={booking.bookingId} className="border-t border-border-light transition-colors hover:bg-surface-elevated/40">
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-mono text-xs font-semibold text-text-primary">{booking.bookingId}</p>
                          <p className="text-xs text-text-muted">{formatDateTime(booking.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-sm text-text-secondary">
                          <p><span className="font-medium text-text-primary">C:</span> {booking.customerId || '-'}</p>
                          <p><span className="font-medium text-text-primary">D:</span> {booking.driverId || '-'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-sm space-y-1 text-sm text-text-secondary">
                          <p className="truncate">{booking.pickupLocation || '-'}</p>
                          <p className="truncate text-text-muted">{booking.dropoffLocation || '-'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-secondary">
                        <p>{VEHICLE_LABELS[booking.vehicleType] || booking.vehicleType || '-'}</p>
                        <p className="text-xs text-text-muted">{PAYMENT_LABELS[booking.paymentMethod] || booking.paymentMethod || '-'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-accent-primary">
                        {formatCurrency(booking.estimatedFare)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-secondary">
                        {formatDateTime(booking.updatedAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(booking.bookingId)}
                          className="inline-flex items-center gap-2 rounded-xl border border-border-light px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-light px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            Showing {showingFrom} to {showingTo} of {pagination.totalElements}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))}
              disabled={pagination.page === 0}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPagination((prev) => ({ ...prev, page: pageNumber }))}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                  pageNumber === pagination.page
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                }`}
              >
                {pageNumber + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.page + 1, Math.max(prev.totalPages - 1, 0)) }))}
              disabled={pagination.page >= pagination.totalPages - 1 || pagination.totalPages === 0}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedBookingId && (
        <DetailModal
          booking={selectedBooking}
          timeline={timeline}
          loading={detailLoading}
          onClose={closeDetail}
          actionState={actionState}
          setActionState={setActionState}
          onCancelBooking={handleCancelBooking}
          onRetryMatching={handleRetryMatching}
          onForceStatus={handleForceStatus}
          actionLoading={actionLoading}
          detailError={detailError}
        />
      )}
    </div>
  );
};

export default BookingsManagement;
