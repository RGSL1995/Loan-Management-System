"use client"

import { useState } from "react"
import { Check, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

const STEPS = [
  { id: "kyc", label: "Identity / KYC" },
  { id: "income", label: "Income & Financials" },
  { id: "consent", label: "Consents" },
  { id: "review", label: "Review & Submit" }
]

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    applicantType: "Individual - Salaried",
    pan: "",
    mobile: "",
    pincode: ""
  })

  // Basic Validation (mocking the prototype's Regex)
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)
  const mobValid = /^[6-9][0-9]{9}$/.test(formData.mobile)
  const pinValid = /^[1-9][0-9]{5}$/.test(formData.pincode)

  const isStep1Valid = panValid && mobValid && pinValid

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Borrower Onboarding</h1>
          <p className="text-sm text-gray-500">New Client KYC & Identity Verification</p>
        </div>
        <Link href="/dashboard/applications" className="text-sm text-gray-500 hover:text-black">
          Cancel
        </Link>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => {
              const isPast = idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div 
                    className={`flex items-center justify-center h-6 px-3 rounded-full text-xs font-bold transition-colors
                      ${isCurrent ? 'bg-black text-white' : 
                        isPast ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {isPast && <Check className="w-3 h-3 mr-1" />}
                    {idx + 1}. {step.label}
                  </div>
                  {idx < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto">
            
            {/* STEP 1: KYC */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Primary Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Applicant Type</label>
                    <select 
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-black outline-none"
                      value={formData.applicantType}
                      onChange={e => setFormData({...formData, applicantType: e.target.value})}
                    >
                      <option>Individual - Salaried</option>
                      <option>Individual - Self Employed</option>
                      <option>Company</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">PAN Number</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="ABCDE1234F"
                        className={`w-full h-10 px-3 border rounded-md text-sm outline-none transition-colors uppercase
                          ${formData.pan ? (panValid ? 'border-green-500 focus:ring-1 focus:ring-green-500' : 'border-red-500 focus:ring-1 focus:ring-red-500') : 'border-gray-300 focus:ring-1 focus:ring-black'}`}
                        value={formData.pan}
                        onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})}
                      />
                      {formData.pan && (
                        <div className={`absolute right-3 top-2.5 text-xs font-bold ${panValid ? 'text-green-600' : 'text-red-600'}`}>
                          {panValid ? '✓ Valid' : '✗ Invalid'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mobile Number</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="9876543210"
                        className={`w-full h-10 px-3 border rounded-md text-sm outline-none transition-colors
                          ${formData.mobile ? (mobValid ? 'border-green-500 focus:ring-1 focus:ring-green-500' : 'border-red-500 focus:ring-1 focus:ring-red-500') : 'border-gray-300 focus:ring-1 focus:ring-black'}`}
                        value={formData.mobile}
                        onChange={e => setFormData({...formData, mobile: e.target.value})}
                      />
                      {formData.mobile && (
                        <div className={`absolute right-3 top-2.5 text-xs font-bold ${mobValid ? 'text-green-600' : 'text-red-600'}`}>
                          {mobValid ? '✓ Valid' : '✗ Invalid'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">PIN Code</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="411001"
                        className={`w-full h-10 px-3 border rounded-md text-sm outline-none transition-colors
                          ${formData.pincode ? (pinValid ? 'border-green-500 focus:ring-1 focus:ring-green-500' : 'border-red-500 focus:ring-1 focus:ring-red-500') : 'border-gray-300 focus:ring-1 focus:ring-black'}`}
                        value={formData.pincode}
                        onChange={e => setFormData({...formData, pincode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Income */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Income & Source of Funds</h2>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
                  <p>In a production environment, this step integrates with Account Aggregator (AA) for automated bank statement analysis.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Declared Annual Income (₹)</label>
                    <input type="number" defaultValue={2500000} className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Upload Bank Statement</label>
                    <input type="file" className="w-full h-10 px-3 pt-1.5 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Consent */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Consents & Disclosures</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded hover:bg-gray-50">
                    <input type="checkbox" className="mt-1" defaultChecked />
                    <div>
                      <div className="text-sm font-bold text-gray-900">Credit Bureau Authorization</div>
                      <div className="text-xs text-gray-500">I authorize Finbyx to pull my credit reports from CIBIL/Experian for underwriting purposes.</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded hover:bg-gray-50">
                    <input type="checkbox" className="mt-1" defaultChecked />
                    <div>
                      <div className="text-sm font-bold text-gray-900">DPDP Act Privacy Consent</div>
                      <div className="text-xs text-gray-500">I consent to the processing of my digital personal data under the DPDP Act, 2023.</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Review & Create Client</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">PAN</span>
                    <span className="text-sm font-bold font-mono">{formData.pan}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-sm text-gray-500">Mobile</span>
                    <span className="text-sm font-bold font-mono">{formData.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Applicant Type</span>
                    <span className="text-sm font-bold">{formData.applicantType}</span>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800 flex items-start gap-2">
                  <Check className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Ready to submit to Apache Fineract (Mock). This will generate a unique <code className="font-bold">applicantKycReference</code> that you can use to originate a LAS loan.</p>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 shrink-0 flex justify-between items-center">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={nextStep}
                disabled={currentStep === 0 && !isStep1Valid}
                className="px-4 py-2 text-sm font-bold text-white bg-black rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Save & Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link 
                href="/dashboard/applications/new/las"
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-1.5"
              >
                Submit & Continue to LAS
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
