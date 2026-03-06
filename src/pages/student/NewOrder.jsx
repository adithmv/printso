import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabase/client"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"
import {
  Printer, Upload, FileText, ArrowLeft,
  Copy, Layers, Clock, MapPin, Loader
} from "lucide-react"

const SLOTS = ["11:00 AM - 11:10 AM", "1:15 PM - 2:00 PM", "3:00 PM - 3:10 PM"]

const PRICES = {
  bw:    { single: 4, double: 6 },
  color: { single: 10, double: 14 },
}

function calcPrice(printType, sides, pages, copies) {
  const pricePerPage = PRICES[printType]?.[sides] ?? 0
  return pricePerPage * pages * copies
}

export default function NewOrder() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(1)
  const [form, setForm] = useState({
    print_type: "bw",
    sides: "single",
    copies: 1,
    delivery_slot: "",
    delivery_class: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = async (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(selected.type)) {
      toast.error("Only PDF, JPG, PNG, DOC, DOCX files are allowed")
      return
    }
    if (selected.size > 20 * 1024 * 1024) {
      toast.error("File size must be under 20MB")
      return
    }
    setFile(selected)
    // Auto detect page count for PDF
    if (selected.type === "application/pdf") {
      try {
        const text = await selected.text()
        const match = text.match(/\/Type\s*\/Page[^s]/g)
        if (match) setPageCount(match.length)
        else setPageCount(1)
      } catch {
        setPageCount(1)
      }
    } else {
      setPageCount(1)
    }
  }

  const totalPrice = calcPrice(form.print_type, form.sides, pageCount, Number(form.copies))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error("Please upload a file"); return }
    if (!form.delivery_slot) { toast.error("Please select a delivery slot"); return }
    if (!form.delivery_class) { toast.error("Please enter your delivery class"); return }

    setLoading(true)
    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from("printfiles")
        .upload(fileName, file)
      if (uploadError) throw uploadError

      setUploading(false)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("printfiles")
        .getPublicUrl(fileName)

      // Create order
      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        print_type: form.print_type,
        sides: form.sides,
        copies: Number(form.copies),
        page_count: pageCount,
        total_price: totalPrice,
        delivery_slot: form.delivery_slot,
        delivery_class: form.delivery_class,
        status: "pending",
      })
      if (orderError) throw orderError

      toast.success("Order placed successfully!")
      navigate("/dashboard")
    } catch (err) {
      toast.error(err.message)
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
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

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">New Print Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details and upload your file</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* File Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Upload size={16} className="text-brand-600" />
              Upload File
            </h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              {file ? (
                <div className="text-center">
                  <FileText size={32} className="mx-auto text-brand-600 mb-2" />
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · {pageCount} {pageCount > 1 ? "pages" : "page"}</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload PDF, JPG, PNG, DOC</p>
                  <p className="text-xs text-gray-300 mt-1">Max size: 20MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Print Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Printer size={16} className="text-brand-600" />
              Print Settings
            </h2>
            <div className="space-y-4">

              {/* Print Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Print Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "bw", label: "Black & White", price: "₹4/page" },
                    { value: "color", label: "Color", price: "₹10/page" },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center justify-center border-2 rounded-xl p-3 cursor-pointer transition ${
                        form.print_type === opt.value
                          ? "border-brand-600 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="print_type"
                        value={opt.value}
                        checked={form.print_type === opt.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                      <span className="text-xs text-brand-600 font-semibold mt-0.5">{opt.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sides */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Layers size={14} className="inline mr-1" />
                  Sides
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "single", label: "Single Sided" },
                    { value: "double", label: "Double Sided" },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center border-2 rounded-xl p-3 cursor-pointer transition ${
                        form.sides === opt.value
                          ? "border-brand-600 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sides"
                        value={opt.value}
                        checked={form.sides === opt.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Copy size={14} className="inline mr-1" />
                  Number of Copies
                </label>
                <input
                  type="number"
                  name="copies"
                  value={form.copies}
                  onChange={handleChange}
                  min={1}
                  max={50}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-brand-600" />
              Delivery Details
            </h2>
            <div className="space-y-4">

              {/* Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Delivery Slot</label>
                <div className="grid grid-cols-2 gap-3">
                  {SLOTS.map(slot => (
                    <label
                      key={slot}
                      className={`flex items-center justify-center border-2 rounded-xl p-3 cursor-pointer transition ${
                        form.delivery_slot === slot
                          ? "border-brand-600 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_slot"
                        value={slot}
                        checked={form.delivery_slot === slot}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Class */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <MapPin size={14} className="inline mr-1" />
                  Delivery Class / Room
                </label>
                <input
                  type="text"
                  name="delivery_class"
                  value={form.delivery_class}
                  onChange={handleChange}
                  placeholder="e.g. Room 204, Block B"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Price Summary</h2>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Print type</span>
                <span>{form.print_type === "bw" ? "Black & White" : "Color"}</span>
              </div>
              <div className="flex justify-between">
                <span>Sides</span>
                <span>{form.sides === "single" ? "Single" : "Double"}</span>
              </div>
              <div className="flex justify-between">
                <span>Pages</span>
                <span>{pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Copies</span>
                <span>{form.copies}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per page</span>
                <span>₹{PRICES[form.print_type]?.[form.sides]}</span>
              </div>
              <div className="border-t border-brand-200 pt-2 mt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
              <p className="text-xs text-gray-400 pt-1">Payment: Cash on delivery</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {uploading ? "Uploading file..." : "Placing order..."}
              </>
            ) : (
              <>
                <Printer size={18} />
                Place Order · ₹{totalPrice}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
