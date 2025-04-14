import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { EditProfileData } from "@/types/userData";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  division_id?: string;
  district_id?: string;
  name: string;
  bn_name: string;
  lat?: string;
  long?: string;
}

interface EditProfileModalProps {
  userData: EditProfileData;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  userData,
  onClose,
}) => {
  const [formData, setFormData] = useState<EditProfileData>(userData);
  const [divisions, setDivisions] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [upazilas, setUpazilas] = useState<Location[]>([]);
  const [date, setDate] = useState<Date | undefined>(
    formData.lastDonated ? new Date(formData.lastDonated) : undefined
  );
  const { toast } = useToast();
  // Current selections for UI
  const [selectedDivision, setSelectedDivision] = useState<string>(
    userData.division || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    userData.district || ""
  );
  const [selectedUpazila, setSelectedUpazila] = useState<string>(
    userData.upazila || ""
  );

  useEffect(() => {
    async function fetchLocations() {
      try {
        const [divisionsRes, districtsRes, upazilasRes] = await Promise.all([
          fetch("/bd-divisions.json"),
          fetch("/bd-districts.json"),
          fetch("/bd-upazilas.json"),
        ]);

        const divisionsData = await divisionsRes.json();
        const districtsData = await districtsRes.json();
        const upazilasData = await upazilasRes.json();

        setDivisions(divisionsData.divisions);
        setDistricts(districtsData.districts);
        setUpazilas(upazilasData.upazilas);

        // Find current division
        const currentDivision = divisionsData.divisions.find(
          (div: Location) => div.name === userData.division
        );

        if (currentDivision) {
          // Find districts in current division
          const districtsInDivision = districtsData.districts.filter(
            (dist: Location) => dist.division_id === currentDivision.id
          );

          // Find current district
          const currentDistrict = districtsInDivision.find(
            (dist: Location) => dist.name === userData.district
          );

          if (currentDistrict) {
            // Find upazillas in current district
            // const upazilasInDistrict = upazilasData.upazilas.filter(
            //   (upz: Location) => upz.district_id === currentDistrict.id
            // );

            // Update form data with location information
            setFormData((prev) => ({
              ...prev,
              latitude: parseFloat(currentDistrict.lat || "0"),
              longitude: parseFloat(currentDistrict.long || "0"),
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }

    fetchLocations();
  }, [userData]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        lastDonated: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
  };

  const handleDivisionChange = (value: string) => {
    const division = divisions.find((div) => div.name === value);
    if (division) {
      setSelectedDivision(value);
      setSelectedDistrict("");
      setSelectedUpazila("");
      setFormData((prev) => ({
        ...prev,
        division: value,
        district: "",
        upazila: "",
        latitude: 0,
        longitude: 0,
      }));
    }
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find((dist) => dist.name === value);
    if (district) {
      setSelectedDistrict(value);
      setSelectedUpazila("");
      setFormData((prev) => ({
        ...prev,
        district: value,
        upazila: "",
        latitude: parseFloat(district.lat || "0"),
        longitude: parseFloat(district.long || "0"),
      }));
    }
  };

  const handleUpazilaChange = (value: string) => {
    setSelectedUpazila(value);
    setFormData((prev) => ({
      ...prev,
      upazila: value,
    }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | { target: { name: string; value: string | boolean } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/user/update", formData);

      if (response.data.success) {
        toast({
          title: "Profile updated successfully!",
          description: "Your profile has been updated successfully.",
          duration: 5000,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Get filtered lists based on selections
  const filteredDistricts = districts.filter((district) => {
    const division = divisions.find((div) => div.name === selectedDivision);
    return division && district.division_id === division.id;
  });

  const filteredUpazilas = upazilas.filter((upazila) => {
    const district = districts.find((dist) => dist.name === selectedDistrict);
    return district && upazila.district_id === district.id;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-red-600">
            Edit Profile
          </CardTitle>
          <CardDescription className="text-center">
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  name="bloodType"
                  value={formData.bloodType}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "bloodType", value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select
                  value={selectedDivision}
                  onValueChange={handleDivisionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.name}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={handleDistrictChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDistricts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upazila">Upazila</Label>
                <Select
                  value={selectedUpazila}
                  onValueChange={handleUpazilaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Upazila" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUpazilas.map((upazila) => (
                      <SelectItem key={upazila.id} value={upazila.name}>
                        {upazila.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastDonated">Last Blood Donation</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !date && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSmoker"
                  checked={formData.isSmoker}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: { name: "isSmoker", value: checked },
                    })
                  }
                />
                <Label htmlFor="isSmoker">Smoker</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasHypertension"
                  checked={formData.hasHypertension}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: { name: "hasHypertension", value: checked },
                    })
                  }
                />
                <Label htmlFor="hasHypertension">Hypertension</Label>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Update Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditProfileModal;
