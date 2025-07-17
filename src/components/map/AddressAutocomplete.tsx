"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { longitude: number; latitude: number }) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  label = "Address",
  placeholder = "Enter address",
  required = false,
  className = "",
  disabled = false,
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState(value);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeTimeout, setGeocodeTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update local state when prop value changes
  useEffect(() => {
    setAddress(value);
  }, [value]);

  // Handle address change with debounced geocoding
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Call onChange immediately with just the address
    onChange(newAddress);
    
    // Clear any existing timeout
    if (geocodeTimeout) {
      clearTimeout(geocodeTimeout);
    }
    
    // Don't geocode if address is too short
    if (newAddress.length < 5) {
      return;
    }
    
    // Set a new timeout for geocoding
    const timeout = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const result = await geocodeAddress(newAddress);
        if (result) {
          // Call onChange with address and coordinates
          onChange(newAddress, {
            longitude: result.longitude,
            latitude: result.latitude,
          });
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      } finally {
        setIsGeocoding(false);
      }
    }, 1000); // 1 second delay
    
    setGeocodeTimeout(timeout);
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="address" className="text-sm font-medium mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id="address"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          className="pl-9 border-pink-200/50"
          disabled={disabled}
          required={required}
        />
        <div className="absolute left-3 top-2.5 text-gray-500">
          {isGeocoding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
}