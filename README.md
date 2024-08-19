# Decode Ethereum Errors

## Purpose
This application is a command-line tool designed to decode Ethereum error messages using ABI definitions. It helps developers and users understand cryptic error messages by translating them into human-readable format.

## Installation

1. Ensure you have Node.js and npm installed on your system.
2. Clone this repository:
   ```
   git clone https://github.com/jeffsmale90/decode-eth
   cd decode-eth
   ```
3. Install the dependencies:
   ```
   yarn install
   ```
4. Install the application globally:
   ```
   yarn global add .
   ```

## Usage

To use the application, run the following command:

```
decode-error <directory> <encodedReason>
```

- `<directory>`: The path to the directory containing JSON files with ABI definitions.
- `<encodedReason>`: The encoded error reason you want to decode.

Example:
```
decode-error ./abi-files 0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a4e6f7420656e6f75676820657468657220617661696c61626c652e0000000000
```

The application will process the input, search for matching ABI definitions, and output the decoded error details in a table format.

## Dependencies

This project uses the `viem` library (version 2.16.2) for Ethereum-related functionality.

## Error Handling

The application includes error handling for:
- JSON parsing issues
- ABI matching failures
- Parameter decoding problems

If any errors occur during the process, appropriate error messages will be displayed.

## Output

The decoded error details are presented in a table format, providing clear and readable information about the error.
