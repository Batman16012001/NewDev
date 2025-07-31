# Templates for Offline Illustration Generation

This directory contains all plan-specific templates and configuration files required for offline PDF generation in the browser.

## Structure

- Each plan has its own subdirectory:
  - `cra/`
  - `pradeepa/`
  - `life/`
  - `life-saver/`
  - `investment/`
  - `advance-payment/`
- Each plan directory contains:
  - `sqs_template.html` — The HTML template for the illustration
  - `TableFormat.json` — Table and rendering configuration
  - `validation_request.json` — JSON schema for input validation

## Usage

- These files are loaded by the frontend when generating an illustration offline.
- All assets (images, fonts, etc.) referenced in the templates must also be available in the public directory.
- If you add a new plan, create a new subdirectory and add the required files. 