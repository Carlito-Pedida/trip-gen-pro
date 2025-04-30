import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { Header } from "components";
import React, { useState } from "react";
import type { Route } from "./+types/create-trip";
import {
  animate,
  Coordinate,
  LayerDirective,
  LayersDirective,
  MapsComponent
} from "@syncfusion/ej2-react-maps";
import {
  comboBoxItems,
  groupTypes,
  interests,
  selectItems,
  travelStyles
} from "~/constants";
import { cn, formatKey } from "~/lib/utils";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
  const response = await fetch("https://restcountries.com/v3.1/all");

  const data = await response.json();

  return data.map((country: any) => ({
    name: country.flag + country.name.common,
    coordinates: country.latlng,
    value: country.name.common,
    openStreetMap: country.maps?.openStreetmap
  }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();

  const countries = loaderData as Country[];

  const [formData, setFormData] = useState<TripFormData>({
    country: countries[0]?.name || "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setloading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setloading(true);

    if (
      !formData.country ||
      !formData.travelStyle ||
      !formData.interest ||
      !formData.budget ||
      !formData.groupType
    ) {
      setError("Please provide values for all fields");
      setloading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be beteween 1 and 10 days");
      setloading(false);
      return;
    }

    const user = await account.get();
    if (!user.$id) {
      console.error("User not Authenticated");
      setloading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.interest,
          userId: user.$id
        })
      });
      const result: CreateTripResponse = await response.json();

      if (result?.id) navigate(`/trips/${result.id}`);
      else console.error("failed to generate trip");
    } catch (error) {
      console.error("Error generating trip", error);
    } finally {
      setloading(false);
    }
  };

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#EA382E",
      coordinates:
        countries.find((country: Country) => country.name === formData.country)
          ?.coordinates || []
    }
  ];

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Generate trip"
        description="View and edit AI-generated travel plans"
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="country">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder="Select Country"
              className="combo-box"
              change={(event: { value: string | undefined }) => {
                if (event.value) {
                  handleChange("country", event.value);
                }
              }}
              allowFiltering
              filtering={(event) => {
                const query = event.text.toLowerCase();

                event.updateData(
                  countries
                    .filter((country) =>
                      country.name.toLowerCase().includes(query)
                    )
                    .map((country) => ({
                      text: country.name,
                      value: country.value
                    }))
                );
              }}
            />
          </div>

          <div>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              placeholder="Enter number of days (5, 12...)"
              className="form-input"
              onChange={(event) =>
                handleChange("duration", Number(event.target.value))
              }
            />
          </div>

          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{formatKey(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item
                }))}
                fields={{ text: "text", value: "value" }}
                placeholder={`Select ${formatKey(key)}`}
                change={(event: { value: string | undefined }) => {
                  if (event.value) {
                    handleChange(key, event.value);
                  }
                }}
                allowFiltering
                filtering={(event) => {
                  const query = event.text.toLowerCase();

                  event.updateData(
                    comboBoxItems[key]
                      .filter((item) => item.toLowerCase().includes(query))
                      .map((item) => ({
                        text: item,
                        value: item
                      }))
                  );
                }}
                className="combo-box"
              />
            </div>
          ))}
          <div>
            <label htmlFor="locatio">Location of the world map</label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath="name"
                  shapeDataPath="country"
                  shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>

          <div className="bg-gray-200 h-px w-full" />

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              className="button-class !h-12 !w-full"
              disabled={loading}
            >
              <img
                src={`/assets/icons/${
                  loading ? "loader.svg" : "magic-star.svg"
                }`}
                alt="magic-star"
                className={cn("size-5", { "animate-spin": loading })}
              />
              <span className="p-16-semibold text-white">
                {loading ? "Generating..." : "Generate Trip"}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};

export default CreateTrip;
