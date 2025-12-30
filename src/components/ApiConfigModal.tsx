import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeApiConfig, isApiConfigured, getStoredApiConfig } from "@/lib/apiConfig";
import { Server, X } from "lucide-react";

interface ApiConfigModalProps {
  onConfigured: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  prefillApiName?: string;
}

const ApiConfigModal = ({ onConfigured, open, onOpenChange, prefillApiName }: ApiConfigModalProps) => {
  const [apiName, setApiName] = useState(prefillApiName || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update apiName when prefillApiName changes
  useEffect(() => {
    if (prefillApiName) {
      setApiName(prefillApiName);
    }
  }, [prefillApiName]);

  // If controlled mode (open prop provided), check if should render
  const isControlled = open !== undefined;
  if (isControlled && !open) {
    return null;
  }

  const validateApiName = (value: string): string | null => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return "API endpoint is required";
    }
    
    // Check for spaces
    if (/\s/.test(trimmed)) {
      return "Spaces are not allowed";
    }
    
    // Check for special characters (only allow letters, numbers, and single dot)
    if (!/^[a-zA-Z0-9.]+$/.test(trimmed)) {
      return "Only letters, numbers, and dot are allowed";
    }
    
    // Must be in format: apiname.domainname (exactly one dot)
    const parts = trimmed.split('.');
    if (parts.length !== 2) {
      return "Format must be: apiname.domainname (e.g. compasalary.api)";
    }
    
    // Both parts must have at least 1 character
    if (parts[0].length < 1 || parts[1].length < 1) {
      return "Both apiname and domainname are required";
    }
    
    // Both parts must start with a letter
    if (!/^[a-zA-Z]/.test(parts[0]) || !/^[a-zA-Z]/.test(parts[1])) {
      return "Both parts must start with a letter";
    }
    
    if (trimmed.length > 100) {
      return "API endpoint must be less than 100 characters";
    }
    
    return null;
  };

  // Real-time validation message
  const getValidationMessage = (): string | null => {
    if (!apiName.trim()) return null;
    return validateApiName(apiName);
  };

  const validationMessage = getValidationMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateApiName(apiName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Store the API configuration
      storeApiConfig(apiName.trim());
      
      // Small delay to ensure storage is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isApiConfigured()) {
        onConfigured();
        onOpenChange?.(false);
      } else {
        setError("Failed to save configuration. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiName(value);
    // Clear manual error when user starts typing (validation message handles real-time feedback)
    if (error) {
      setError("");
    }
  };

  const isValid = apiName.trim().length > 0 && !validateApiName(apiName);

  const handleClose = () => {
    onOpenChange?.(false);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop - fully blocks interaction */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={isControlled ? handleClose : undefined}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-config-title"
      >
        {/* Close button - only show in controlled mode */}
        {isControlled && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}

        {/* Decorative Top Border */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Server className="w-8 h-8 text-primary" />
          </div>
          <h2 
            id="api-config-title" 
            className="text-2xl font-bold text-gray-900"
          >
            Configure API Endpoint
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter the API endpoint in the format: apiname.domainname
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="api-name" className="text-sm font-semibold text-gray-700">
              API Endpoint
            </Label>
            <Input
              id="api-name"
              type="text"
              value={apiName}
              onChange={handleInputChange}
              className={`w-full rounded-xl border-2 ${
                validationMessage || error ? "border-red-400 focus:border-red-500" : isValid ? "border-green-400 focus:border-green-500" : "border-gray-200 focus:border-primary"
              } focus-visible:ring-0 focus-visible:ring-offset-0 transition-all py-5 text-base`}
              placeholder="e.g. compasalary.api"
              autoFocus
              autoComplete="off"
            />
            {/* Real-time validation message */}
            {validationMessage && (
              <p className="text-sm text-red-500 mt-1 animate-fade-in">
                {validationMessage}
              </p>
            )}
            {/* Submit error message */}
            {error && !validationMessage && (
              <p className="text-sm text-red-500 mt-1 animate-fade-in">
                {error}
              </p>
            )}
            {/* Success indicator */}
            {isValid && !error && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Valid format
              </p>
            )}
          </div>

          <div className={`flex ${isControlled ? 'gap-3' : ''}`}>
            {isControlled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl py-5 font-semibold text-base"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`${isControlled ? 'flex-1' : 'w-full'} rounded-xl py-5 font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              style={{ backgroundColor: '#351C75' }}
            >
              {isSubmitting ? "Configuring..." : isControlled ? "Update" : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiConfigModal;
