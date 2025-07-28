<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ProviderRegistrationRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'email' => ['required', 'string', 'email', 'unique:providers'],
            'phone_number' => ['required', 'string', 'unique:providers', 'regex:/^\+?[1-9]\d{1,14}$/'],
            'password' => [
                'required', 
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/'
            ],
            'specialization' => ['required', 'string', 'min:3', 'max:100'],
            'license_number' => ['required', 'string', 'unique:providers', 'regex:/^[a-zA-Z0-9]+$/'],
            'years_of_experience' => ['required', 'integer', 'min:0', 'max:50'],
            'clinic_address' => ['required', 'array'],
            'clinic_address.street' => ['required', 'string', 'max:200'],
            'clinic_address.city' => ['required', 'string', 'max:100'],
            'clinic_address.state' => ['required', 'string', 'max:50'],
            'clinic_address.zip' => ['required', 'string', 'regex:/^\d{5}(-\d{4})?$/'],
            'license_document_url' => ['nullable', 'string', 'url']
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'phone_number.regex' => 'Phone number must be in international format.',
            'license_number.regex' => 'License number must contain only letters and numbers.',
            'clinic_address.zip.regex' => 'ZIP code must be in valid US format (e.g., 12345 or 12345-6789).',
        ];
    }
}
