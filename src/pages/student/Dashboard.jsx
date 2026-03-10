import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../../supabase/client"
import { useAuth } from "../../context/AuthContext"
import { Printer, Plus, Clock, CheckCircle, XCircle, Package, LogOut, FileText, Loader } from "lucide-react"
import toast from "react-hot-toast"

const statusConfig = {
  pending:   { label: "Pending",     color: "bg-yellow-100 text-yellow-700",  icon: Clock },
  accepted:  { label: "Accepted",    color: "bg-blue-100 text-blue-700",      icon: CheckCircle },
  printed:   { label: "Printed",     color: "bg-purple-100 text-purple-700",  icon: Printer },
  delivered: { label: "Delivered",   color: "bg-green-100 text-green-700",    icon: Package },
  cancelled: { label: "Cancelled",   color: "bg-red-100 text-red-700",        icon: XCircle },
}

export default function StudentDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const subscription = supabase
      .channel("orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [])

const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (!error) setOrders(data)
    setLoading(false)
  }

  const handleCancel = async (orderId) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .eq("status", "pending")
    if (error) toast.error("Could not cancel order")
    else toast.success("Order cancelled")
  }

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status))
  const pastOrders = orders.filter(o => ["delivered", "cancelled"].includes(o.status))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Printer size={18} />
            </div>
            <span className="text-xl font-bold text-brand-600">Printso</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">Hi, {profile?.name}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage your print orders</p>
          </div>
          <Link
            to="/new-order"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} />
            New Order
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{profile?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Class</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{profile?.class}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Batch</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{profile?.batch}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide"></p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{profile?.study_time}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={28} className="animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            {/* Active Orders */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-3">Active Orders</h2>
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No active orders</p>
                  <Link to="/new-order" className="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block">
                    Place your first order
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCancel={handleCancel}
                      navigate={navigate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-700 mb-3">Past Orders</h2>
                <div className="space-y-3">
                  {pastOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCancel={handleCancel}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, onCancel, navigate }) {
  const status = statusConfig[order.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition"
      onClick={() => navigate(`/order/${order.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="bg-brand-50 text-brand-600 p-2 rounded-lg mt-0.5">
          <FileText size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{order.file_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.print_type === "bw" ? "Black & White" : "Color"} · {order.copies} {order.copies > 1 ? "copies" : "copy"} · {order.sides === "single" ? "Single" : "Double"} sided
          </p>
          <p className="text-xs text-gray-400">Slot: {order.delivery_slot}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
        <p className="text-sm font-bold text-gray-800">₹{order.total_price}</p>
        {order.status === "pending" && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(order.id) }}
            className="text-xs text-red-500 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
