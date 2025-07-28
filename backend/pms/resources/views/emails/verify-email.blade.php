<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 3px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hello {{ $name }},</h2>
        <p>Thank you for registering with our healthcare platform. Please click the button below to verify your email address:</p>
        
        <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
        
        <p>If you did not create an account, no further action is required.</p>
        
        <p>If you're having trouble clicking the "Verify Email Address" button, copy and paste the following URL into your web browser:</p>
        
        <p>{{ $verificationUrl }}</p>
        
        <p>Best regards,<br>Your Healthcare Team</p>
    </div>
</body>
</html>
