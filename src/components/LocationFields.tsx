"use client";

import { ChevronDown } from "lucide-react";
import { getCountries, getStates, getCities } from "@/data/locationData";

interface LocationFieldsProps {
  country: string;
  state: string;
  city: string;
  onChange: (field: "country" | "state" | "city", value: string) => void;
  accentColor?: "indigo" | "emerald";
}

// Sub-components moved outside to prevent re-creation and focus loss
const SelectDropdown = ({
  label,
  value,
  onChange: onSel,
  options,
  placeholder,
  wrapClass,
  baseInputClass
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  wrapClass: string;
  baseInputClass: string;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className={wrapClass}>
      <select
        value={value}
        onChange={(e) => onSel(e.target.value)}
        className={`${baseInputClass} appearance-none pr-10`}
      >
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-black bg-white dark:text-white dark:bg-zinc-900">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const FreeInput = ({
  label,
  value,
  onInput,
  placeholder,
  wrapClass,
  baseInputClass
}: {
  label: string;
  value: string;
  onInput: (v: string) => void;
  placeholder: string;
  wrapClass: string;
  baseInputClass: string;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className={wrapClass}>
      <input
        value={value}
        onChange={(e) => onInput(e.target.value)}
        placeholder={placeholder}
        className={baseInputClass}
      />
    </div>
  </div>
);

export function LocationFields({
  country,
  state,
  city,
  onChange,
  accentColor = "indigo",
}: LocationFieldsProps) {
  const countries = getCountries();
  const states = getStates(country);
  const cities = getCities(country, state);
  const isIndia = country === "India";
  const ring = accentColor === "indigo" ? "focus-within:ring-indigo-500/50" : "focus-within:ring-emerald-500/50";

  const baseInputClass = `w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white`;
  const wrapClass = `relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 ${ring} transition-all`;

  const handleCountryChange = (c: string) => {
    onChange("country", c);
    onChange("state", "");
    onChange("city", "");
  };

  const handleStateChange = (s: string) => {
    onChange("state", s);
    onChange("city", "");
  };

  return (
    <>
      {/* Country — always a dropdown */}
      <SelectDropdown
        label="Country"
        value={country}
        onChange={handleCountryChange}
        options={countries}
        placeholder="Select Country"
        wrapClass={wrapClass}
        baseInputClass={baseInputClass}
      />

      {/* State — dropdown for India, free text for others */}
      <div className="grid grid-cols-2 gap-3">
        {isIndia ? (
          <SelectDropdown
            label="State"
            value={state}
            onChange={handleStateChange}
            options={states}
            placeholder="Select State"
            wrapClass={wrapClass}
            baseInputClass={baseInputClass}
          />
        ) : (
          <FreeInput
            label="State / Province"
            value={state}
            onInput={(v) => onChange("state", v)}
            placeholder="Enter state"
            wrapClass={wrapClass}
            baseInputClass={baseInputClass}
          />
        )}

        {/* City — dropdown for India (if state chosen), free text for others */}
        {isIndia ? (
          <SelectDropdown
            label="City"
            value={city}
            onChange={(v) => onChange("city", v)}
            options={cities}
            placeholder={state ? "Select City" : "Select State first"}
            wrapClass={wrapClass}
            baseInputClass={baseInputClass}
          />
        ) : (
          <FreeInput
            label="City"
            value={city}
            onInput={(v) => onChange("city", v)}
            placeholder="Enter city"
            wrapClass={wrapClass}
            baseInputClass={baseInputClass}
          />
        )}
      </div>

      {!isIndia && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 -mt-1">
          ✏️ Type the state / province and city name for this country.
        </p>
      )}
    </>
  );
}
