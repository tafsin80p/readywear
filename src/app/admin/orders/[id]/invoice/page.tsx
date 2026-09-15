"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer, Download, ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function InvoiceEditor() {
  const params = useParams();
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  
  // Editable fields
  const [date, setDate] = useState("");
  const [orderSl, setOrderSl] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [pathaoParcelId, setPathaoParcelId] = useState("");
  const [codAmount, setCodAmount] = useState("");
  const [productCode, setProductCode] = useState("");
  const [size, setSize] = useState("");
  const [totalProduct, setTotalProduct] = useState("");
  const [productImagePath, setProductImagePath] = useState("");
  
  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        const o = data.order;
        setOrder(o);
        
        // Populate fields
        const orderDate = new Date(o.createdAt);
        setDate(`${orderDate.getDate().toString().padStart(2, '0')}.${(orderDate.getMonth() + 1).toString().padStart(2, '0')}.${orderDate.getFullYear()}`);
        setCustomerName(`${o.customerInfo.firstName} ${o.customerInfo.lastName || ""}`.trim());
        setMobileNumber(o.customerInfo.phone);
        setAddress(`${o.customerInfo.address}, ${o.customerInfo.area}`);
        setCodAmount(o.pricing.total.toString());
        
        // Items details
        if (o.items && o.items.length > 0) {
          const firstItem = o.items[0];
          setProductCode(firstItem.title);
          setSize(firstItem.size || "");
          
          let imageUrl = firstItem.image || "";
          if (imageUrl.startsWith("http")) {
            try {
              const imgRes = await fetch(imageUrl);
              const imgBlob = await imgRes.blob();
              const reader = new FileReader();
              reader.readAsDataURL(imgBlob);
              reader.onloadend = () => {
                setProductImagePath(reader.result as string);
              };
            } catch (e) {
              setProductImagePath(imageUrl);
            }
          } else {
            setProductImagePath(imageUrl);
          }
          
          const totalQty = o.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
          setTotalProduct(totalQty.toString());
        }
      } else {
        toast.error("Failed to load order");
      }
    } catch (error) {
      toast.error("Error loading order");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Invoice_${order?.orderId || 'Download'}.png`;
      link.click();
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PNG");
    }
  };

  const handlePrintPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order?.orderId || 'Download'}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Invoice...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Invoice Editor</h1>
              <p className="text-sm text-gray-500">Order: {order?.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button 
              onClick={handleDownloadPNG}
              className="flex items-center gap-2 px-4 py-2 bg-[#6B46C1] text-white rounded-xl hover:bg-[#553C9A] transition-colors font-medium text-sm shadow-sm"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Form */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Edit details</h2>
              <p className="text-xs text-gray-500 mb-6">Changes update the preview instantly.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Date</label>
                  <input type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Order SL</label>
                  <input type="text" value={orderSl} onChange={e => setOrderSl(e.target.value)} placeholder="Type manually" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Customer name</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Mobile number</label>
                  <input type="text" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Pathao Parcel ID</label>
                  <input type="text" value={pathaoParcelId} onChange={e => setPathaoParcelId(e.target.value)} placeholder="Type manually" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">COD amount</label>
                  <input type="text" value={codAmount} onChange={e => setCodAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Product code</label>
                  <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Size</label>
                  <input type="text" value={size} onChange={e => setSize(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">Total product</label>
                  <input type="text" value={totalProduct} onChange={e => setTotalProduct(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                {/* Removed Product image path field as requested */}
                
                <button className="w-full bg-[#1e7e34] text-white py-3 rounded-lg font-bold mt-4 hover:bg-[#155d27] transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save invoice changes
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Preview */}
          <div className="flex-1 flex justify-center items-start overflow-auto">
            <div 
              ref={invoiceRef}
              className="bg-white p-10 w-[550px] shadow-sm border-2 border-purple-600 flex flex-col"
              style={{ minHeight: '750px', fontFamily: 'Arial, sans-serif', color: 'black' }}
            >
              {/* Invoice Header */}
              <div className="flex justify-between items-center mb-8 font-bold text-[15px]">
                <div>Date: {date}</div>
                <div>Order SL: {orderSl}</div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4 mb-6 font-bold text-[14px]">
                <div>Customer Name: <span className="font-normal">{customerName}</span></div>
                <div>Mobile Number: <span className="font-normal">{mobileNumber}</span></div>
                <div>Address: <span className="font-normal">{address}</span></div>
                <div className="flex items-center gap-2 mt-4">
                  <span>Pathao Parcel ID:</span> 
                  <span className="border-b-[1.5px] border-black inline-block w-48 h-5">{pathaoParcelId}</span>
                </div>
              </div>

              {/* COD Amount */}
              <div className="mb-8 font-black text-3xl">
                COD: {codAmount} TK
              </div>

              {/* Product Details */}
              <div className="mb-4 font-bold text-[14px] text-center flex flex-col items-center">
                <div>Product Code: <span className="font-normal">{productCode}</span></div>
                {size && <div className="mt-1">Size: <span className="font-normal">{size}</span></div>}
              </div>

              {/* Product Image */}
              <div className="flex justify-center mb-8 min-h-[300px] flex-1">
                {productImagePath ? (
                  <img 
                    src={productImagePath.startsWith('http') || productImagePath.startsWith('data:') ? productImagePath : `/${productImagePath}`} 
                    alt="Product" 
                    className="max-w-full max-h-[350px] object-contain"
                  />
                ) : (
                  <div className="w-[300px] h-[350px] bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end font-bold text-[15px] border-t-[1.5px] border-black pt-4 mt-auto">
                <div>MEHZIN KIDS</div>
                <div>Total Product: {totalProduct}</div>
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
