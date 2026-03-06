import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabase/client"
import { useAuth } from "../../context/AuthContext"
import {
  Printer, LogOut, Clock, CheckCircle,
  Package, XCircle, FileText, Loader, Filter
} from "lucide-react"
import toast from "react-hot-toast"

const statusConfig = {
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", icon: Clock },
  accepted:  { label: "Accepted",  color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  printed:   { label: "Printed",   color: "bg-purple-100 text-purple-700", icon: Printer },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700",   icon: Package },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700",       icon: XCircle },
}

export default function OwnerDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
    const subscription = supabase
      .channel("owner-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, users(name, class, batch, phone)")
      .order("created_at", { ascending: false })
    if (!error) setOrders(data)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/owner-login")
  }

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter)

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    accepted:  orders.filter(o => o.status === "accepted").length,
    printed:   orders.filter(o => o.status === "printed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Printer size={18} />
            </div>
            <span className="text-xl font-bold text-brand-600">Printso</span>
            <span className="text-xs bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium ml-1">Owner</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all incoming print orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: "pending",   label: "Pending",   color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
            { key: "accepted",  label: "Accepted",  color: "text-blue-600 bg-blue-50 border-blue-100" },
            { key: "printed",   label: "Printed",   color: "text-purple-600 bg-purple-50 border-purple-100" },
            { key: "delivered", label: "Delivered", color: "text-green-600 bg-green-50 border-green-100" },
          ].map(stat => (
            <div key={stat.key} className={`rounded-xl border p-4 ${stat.color}`}>
              <p className="text-2xl font-bold">{counts[stat.key]}</p>
              <p className="text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <Filter size={14} className="text-gray-400 shrink-0" />
          {["all", "pending", "accepted", "printed", "delivered", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                filter === f
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "cancelled" && f !== "all" && counts[f] > 0 && (
                <span className="ml-1.5 bg-white bg-opacity-30 text-xs px-1 rounded-full">
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="animate-spin text-brand-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <OwnerOrderCard
                key={order.id}
                order={order}
                navigate={navigate}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function OwnerOrderCard({ order, navigate }) {
  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition cursor-pointer"
      onClick={() => navigate(`/owner/order/${order.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="bg-brand-50 text-brand-600 p-2 rounded-lg mt-0.5 shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{order.file_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.users?.name} · {order.users?.class} · {order.users?.phone}
            </p>
            <p className="text-xs text-gray-400">
              {order.print_type === "bw" ? "B&W" : "Color"} · {order.copies} {order.copies > 1 ? "copies" : "copy"} · {order.sides === "single" ? "Single" : "Double"} sided
            </p>
            <p className="text-xs text-gray-400">
              Slot: {order.delivery_slot} · Room: {order.delivery_class}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
          <p className="text-sm font-bold text-gray-800">₹{order.total_price}</p>
          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
