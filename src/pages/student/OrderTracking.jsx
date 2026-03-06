import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../../supabase/client"
import { ArrowLeft, Printer, Clock, CheckCircle, Package, XCircle, FileText, Download, Loader } from "lucide-react"

const STEPS = [
  { key: "pending",   label: "Order Placed", icon: Clock },
  { key: "accepted",  label: "Accepted",     icon: CheckCircle },
  { key: "printed",   label: "Printed",      icon: Printer },
  { key: "delivered", label: "Delivered",    icon: Package },
]

const statusIndex = { pending: 0, accepted: 1, printed: 2, delivered: 3, cancelled: -1 }

export default function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchOrder()
    const subscription = supabase
      .channel("order-" + id)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: "id=eq." + id,
      }, (payload) => {
        setOrder(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [id])

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, users(name, class, batch, phone)")
      .eq("id", id)
      .single()
    if (!error) setOrder(data)
    setLoading(false)
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

  const currentStep = statusIndex[order.status]
  const isCancelled = order.status === "cancelled"

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
              <Printer size={18} />
            </div>
            <span className="text-xl font-bold text-brand-600">Printso</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <p className="text-xs text-gray-400 mt-0.5">Order ID: {order.id}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Order Status</h2>
          {isCancelled ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
              <XCircle size={24} className="text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
                <p className="text-xs text-red-400">This order has been cancelled</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
                <div
                  className="h-full bg-brand-600 transition-all duration-500"
                  style={{ width: ((currentStep / (STEPS.length - 1)) * 100) + "%" }}
                />
              </div>
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStep
                const isCurrent = index === currentStep
                return (
                  <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all " +
                        (isCompleted ? "bg-brand-600 border-brand-600 text-white " : "bg-white border-gray-300 text-gray-300 ") +
                        (isCurrent ? "ring-4 ring-brand-100" : "")
                      }
                    >
                      <Icon size={18} />
                    </div>
                    <p className={"text-xs mt-2 text-center font-medium " + (isCompleted ? "text-brand-600" : "text-gray-400")}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
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
            
             <a  href={order.file_url}>
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
            
              <Download size={16} />
              View
            </a>
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
      </div>
    </div>
  )
}