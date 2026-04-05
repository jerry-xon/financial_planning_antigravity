import { useState } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';

export function FamilyProfile() {
  const [selfDetails] = useState({
    name: 'Rahul',
    dob: '1994-03-28',
    mobile: '9785893545',
    occupation: 'Salaried',
    business: 'IT',
    organization: 'ABC corp',
    education: 'B Tech',
    retirementAge: '60',
    retirementYear: '2054'
  });

  const [spouseDetails] = useState({
    name: 'Riya',
    dob: '1995-10-28',
    mobile: '9887151259',
    occupation: 'Salaried',
    business: 'Media',
    organization: 'VCG News',
    education: 'MBA',
    retirementAge: '60',
    retirementYear: '2055'
  });

  const [childDetails] = useState({
    name: 'Radhika',
    dob: '2020-11-20',
    studyingAt: 'School',
    standard: 'LKG',
    schoolFee: '45000'
  });

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Profile & Objectives</h1>
        <p className="text-gray-600">
          Please provide details for yourself and your family members to build a comprehensive financial roadmap.
        </p>
      </div>

      {/* Self Details Section */}
      <Card className="mb-6 p-6 border-2 border-blue-500 shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
            Self Details
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="self-name" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              👤 Name
            </Label>
            <Input 
              id="self-name" 
              value={selfDetails.name}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-dob" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📅 Date of Birth
            </Label>
            <Input 
              id="self-dob" 
              type="date"
              value={selfDetails.dob}
              className="bg-white"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Current Age: {calculateAge(selfDetails.dob)} Years
            </p>
          </div>

          <div>
            <Label htmlFor="self-mobile" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📱 Mobile Number *
            </Label>
            <Input 
              id="self-mobile" 
              value={selfDetails.mobile}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-occupation" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              💼 Occupation
            </Label>
            <Select value={selfDetails.occupation}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salaried">Salaried</SelectItem>
                <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="self-business" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🏢 Nature of Business / Profession
            </Label>
            <Input 
              id="self-business" 
              value={selfDetails.business}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-org" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🏛️ Name of Business / Organization
            </Label>
            <Input 
              id="self-org" 
              value={selfDetails.organization}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-education" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🎓 Educational Qualification
            </Label>
            <Input 
              id="self-education" 
              value={selfDetails.education}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-retirement-age" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📅 Retirement Age
            </Label>
            <Input 
              id="self-retirement-age" 
              value={selfDetails.retirementAge}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="self-retirement-year" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🗓️ Retirement Year
            </Label>
            <Input 
              id="self-retirement-year" 
              value={selfDetails.retirementYear}
              className="bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Spouse Details Section */}
      <Card className="mb-6 p-6 border-2 border-green-500 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            Spouse Details
          </h2>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="spouse-name" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              👤 Name
            </Label>
            <Input 
              id="spouse-name" 
              value={spouseDetails.name}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-dob" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📅 Date of Birth
            </Label>
            <Input 
              id="spouse-dob" 
              type="date"
              value={spouseDetails.dob}
              className="bg-white"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Current Age: {calculateAge(spouseDetails.dob)} Years
            </p>
          </div>

          <div>
            <Label htmlFor="spouse-mobile" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📱 Mobile Number *
            </Label>
            <Input 
              id="spouse-mobile" 
              value={spouseDetails.mobile}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-occupation" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              💼 Occupation
            </Label>
            <Select value={spouseDetails.occupation}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Salaried">Salaried</SelectItem>
                <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="spouse-business" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🏢 Nature of Business / Profession
            </Label>
            <Input 
              id="spouse-business" 
              value={spouseDetails.business}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-org" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🏛️ Name of Business / Organization
            </Label>
            <Input 
              id="spouse-org" 
              value={spouseDetails.organization}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-education" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🎓 Educational Qualification
            </Label>
            <Input 
              id="spouse-education" 
              value={spouseDetails.education}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-retirement-age" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📅 Retirement Age
            </Label>
            <Input 
              id="spouse-retirement-age" 
              value={spouseDetails.retirementAge}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="spouse-retirement-year" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🗓️ Retirement Year
            </Label>
            <Input 
              id="spouse-retirement-year" 
              value={spouseDetails.retirementYear}
              className="bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Child Details Section */}
      <Card className="mb-6 p-6 border-2 border-purple-500 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            Child Details
          </h2>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="child-name" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              👶 Name
            </Label>
            <Input 
              id="child-name" 
              value={childDetails.name}
              className="bg-white"
            />
          </div>

          <div>
            <Label htmlFor="child-dob" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📅 Date of Birth
            </Label>
            <Input 
              id="child-dob" 
              type="date"
              value={childDetails.dob}
              className="bg-white"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Current Age: {calculateAge(childDetails.dob)} Years
            </p>
          </div>

          <div>
            <Label htmlFor="child-studying" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              🏫 Studying at
            </Label>
            <Select value={childDetails.studyingAt}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="College">College</SelectItem>
                <SelectItem value="University">University</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="child-standard" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              📚 Studying in Standard
            </Label>
            <Select value={childDetails.standard}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LKG">LKG</SelectItem>
                <SelectItem value="UKG">UKG</SelectItem>
                <SelectItem value="1st">1st</SelectItem>
                <SelectItem value="2nd">2nd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="child-fee" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              💰 Annual School Fee (₹)
            </Label>
            <Input 
              id="child-fee" 
              value={childDetails.schoolFee}
              className="bg-white"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Note:</span> Higher education (College) planning will be done in Goals Section.
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Spouse
        </Button>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Child
        </Button>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base shadow-lg">
          Generate Family Analysis
        </Button>
      </div>

      {/* Family Profile Analysis */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Family Profile Analysis</h2>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Self Card */}
          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                R
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rahul (Self)</h3>
                <p className="text-sm text-gray-600">Primary Member</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📅 Age:</span>
                <span className="font-medium text-gray-900">32 Years</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">💼 Occupation:</span>
                <span className="font-medium text-gray-900">Salaried</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">🗓️ Retirement Year:</span>
                <span className="font-medium text-gray-900">2054</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">⏰ Window:</span>
                <span className="font-medium text-gray-900">28 Years</span>
              </div>
            </div>
          </Card>

          {/* Spouse Card */}
          <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                R
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Riya (Spouse)</h3>
                <p className="text-sm text-gray-600">Family Member</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📅 Age:</span>
                <span className="font-medium text-gray-900">30 Years</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">💼 Occupation:</span>
                <span className="font-medium text-gray-900">Salaried</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">🗓️ Retirement Year:</span>
                <span className="font-medium text-gray-900">2055</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">⏰ Window:</span>
                <span className="font-medium text-gray-900">30 Years</span>
              </div>
            </div>
          </Card>

          {/* Child Card */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                R
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Radhika (Child)</h3>
                <p className="text-sm text-gray-600">Dependent</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">📅 Age:</span>
                <span className="font-medium text-gray-900">5 Years</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">💼 Occupation:</span>
                <span className="font-medium text-gray-900">School</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">🎓 Education:</span>
                <span className="font-medium text-gray-900">LKG</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Next Step Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base gap-2 shadow-lg">
            Proceed to Cash Flow
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        © 2026 FinPlan - Comprehensive Financial Planning Report
      </div>
    </div>
  );
}
