import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../../supabase/client"
import { ArrowLeft, Printer, FileText, Download, User, Phone, BookOpen, Clock, CheckCircle, Package, XCircle, Loader } from "lucide-react"
import toast from "react-hot-toast"

const STATUS_FLOW = ["pending", "accepted", "printed", "delivered"]

const statusConfig = {
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", icon: Clock },
  accepted:  { label: "Accepted",  color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  printed:   { label: "Printed",   color: "bg-purple-100 text-purple-700", icon: Printer },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700",   icon: Package },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700",       icon: XCircle },
}

const nextActionLabel = {
  pending:  "Accept Order",
  accepted: "Mark as Printed",
  printed:  "Mark as Delivered",
}

const nextStatus = {
  pending:  "accepted",
  accepted: "printed",
  printed:  "delivered",
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchOrder()
    const subscription = supabase
      .channel("owner-order-" + id)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: "id=eq." + id,
      }, (payload) => setOrder(payload.new))
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [id])

  const fetchOrder = async () => {
    const { data, error } = await supabase
  .from("orders")
  .select("*, users(name, class, batch, phone)")
  .eq("id", id)
  .single()
if (error) console.log("ORDER FETCH ERROR:", error)
    if (!error) setOrder(data)
    setLoading(false)
  }

  const handleUpdateStatus = async () => {
    const next = nextStatus[order.status]
    if (!next) return
    setUpdating(true)
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("id", id)
    if (error) toast.error("Failed to update status")
    else {
      toast.success("Order marked as " + next)
      setOrder(prev => ({ ...prev, status: next }))
    }
    setUpdating(false)
  }

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    setUpdating(true)
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
    if (error) toast.error("Failed to cancel order")
    else {
      toast.success("Order cancelled")
      setOrder(prev => ({ ...prev, status: "cancelled" }))
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={28} className="animate-spin text-brand-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Order not found</p>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon
  const canProgress = nextStatus[order.status] !== undefined
  const currentStep = STATUS_FLOW.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/owner/dashboard")} className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Printer size={18} />
            </div>
            <span className="text-xl font-bold text-brand-600">Printso</span>
            <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium ml-1">Owner</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Detail</h1>
            <p className="text-xs text-gray-400 mt-0.5">ID: {order.id}</p>
          </div>
          <span className={"flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full " + status.color}>
            <StatusIcon size={13} />
            {status.label}
          </span>
        </div>

        {order.status !== "cancelled" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Progress</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                <div
                  className="h-full bg-brand-600 transition-all duration-500"
                  style={{ width: currentStep >= 0 ? ((currentStep / (STATUS_FLOW.length - 1)) * 100) + "%" : "0%" }}
                />
              </div>
              {STATUS_FLOW.map((s, index) => {
                const cfg = statusConfig[s]
                const Icon = cfg.icon
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep
                return (
                  <div key={s} className="flex flex-col items-center z-10 flex-1">
                    <div className={
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all " +
                      (isCompleted ? "bg-brand-600 border-brand-600 text-white " : "bg-white border-gray-300 text-gray-300 ") +
                      (isCurrent ? "ring-4 ring-brand-100" : "")
                    }>
                      <Icon size={18} />
                    </div>
                    <p className={"text-xs mt-2 text-center font-medium " + (isCompleted ? "text-brand-600" : "text-gray-400")}>
                      {cfg.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Student Info</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: User,     label: "Name",       value: order.users?.name },
              { icon: Phone,    label: "Phone",      value: order.users?.phone },
              { icon: BookOpen, label: "Class",      value: order.users?.class },
              
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-700">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">File</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 text-brand-600 p-2 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{order.file_name}</p>
                <p className="text-xs text-gray-400">{order.page_count} {order.page_count > 1 ? "pages" : "page"}</p>
              </div>
            </div>
            <button
              onClick={() => window.open(order.file_url, "_blank")}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
            >
              <Download size={15} />
              Download
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Print Type",     value: order.print_type === "bw" ? "Black & White" : "Color" },
              { label: "Sides",          value: order.sides === "single" ? "Single Sided" : "Double Sided" },
              { label: "Copies",         value: order.copies },
              { label: "Pages",          value: order.page_count },
              { label: "Delivery Slot",  value: order.delivery_slot },
              { label: "Delivery Class", value: order.delivery_class },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-gray-600">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-800 text-base">
              <span>Total Amount</span>
              <span>₹{order.total_price}</span>
            </div>
            <p className="text-xs text-gray-400">Payment: Cash on delivery</p>
          </div>
        </div>

        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="space-y-3 pb-6">
            {canProgress && (
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                {nextActionLabel[order.status]}
              </button>
            )}
            {order.status === "pending" && (
              <button
                onClick={handleCancel}
                disabled={updating}
                className="w-full bg-white hover:bg-red-50 text-red-500 border border-red-200 font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Cancel Order
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}