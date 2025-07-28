<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Carbon\Carbon;

class PatientRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:patients'],
            'phone_number' => ['required', 'string', 'unique:patients', 'regex:/^\+[1-9]\d{1,14}$/'],
            'password' => [
                'required', 
                'string', 
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'date_of_birth' => [
                'required', 
                'date', 
                'before:today',
                function ($attribute, $value, $fail) {
                    $age = Carbon::parse($value)->age;
                    if ($age < 13) {
                        $fail('Patient must be at least 13 years old (COPPA compliance).');
                    }
                }
            ],
            'gender' => ['required', 'string', 'in:male,female,other,prefer_not_to_say'],
            
            // Address validation
            'address' => ['required', 'array'],
            'address.street' => ['required', 'string', 'max:200'],
            'address.city' => ['required', 'string', 'max:100'],
            'address.state' => ['required', 'string', 'max:50'],
            'address.zip' => ['required', 'string', 'regex:/^\d{5}(-\d{4})?$/'],
            
            // Emergency contact validation
            'emergency_contact' => ['nullable', 'array'],
            'emergency_contact.name' => ['required_with:emergency_contact', 'nullable', 'string', 'max:100'],
            'emergency_contact.phone' => [
                'required_with:emergency_contact', 
                'nullable', 
                'string', 
                'regex:/^\+[1-9]\d{1,14}$/'
            ],
            'emergency_contact.relationship' => ['required_with:emergency_contact', 'nullable', 'string', 'max:50'],
            
            // Insurance validation
            'insurance_info' => ['nullable', 'array'],
            'insurance_info.provider' => ['required_with:insurance_info', 'nullable', 'string', 'max:100'],
            'insurance_info.policy_number' => ['required_with:insurance_info', 'nullable', 'string', 'max:50'],
            
            // Medical history validation
            'medical_history' => ['nullable', 'array'],
            'medical_history.*' => ['string', 'max:500'],
            
            // Consent validations
            'marketing_consent' => ['boolean'],
            'terms_accepted' => ['required', 'accepted']
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'date_of_birth' => 'date of birth',
            'address.street' => 'street address',
            'address.zip' => 'ZIP code',
            'emergency_contact.name' => 'emergency contact name',
            'emergency_contact.phone' => 'emergency contact phone',
            'emergency_contact.relationship' => 'emergency contact relationship',
            'insurance_info.provider' => 'insurance provider',
            'insurance_info.policy_number' => 'insurance policy number'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('email')) {
            $this->merge([
                'email' => strtolower($this->email)
            ]);
        }

        if ($this->filled('phone_number')) {
            // Remove all non-digit characters except '+'
            $phone = preg_replace('/[^0-9+]/', '', $this->phone_number);
            $this->merge(['phone_number' => $phone]);
        }

        if ($this->filled('emergency_contact.phone')) {
            $emergencyPhone = preg_replace('/[^0-9+]/', '', $this->input('emergency_contact.phone'));
            $this->merge([
                'emergency_contact' => array_merge($this->emergency_contact, ['phone' => $emergencyPhone])
            ]);
        }
    }
}
