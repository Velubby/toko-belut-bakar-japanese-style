<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set header
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once dirname(__FILE__) . '/midtrans/Midtrans.php';

// Set Midtrans Configuration for Sandbox
\Midtrans\Config::$serverKey = 'SB-Mid-server-H7JelyvyVhS-o_U_bdQGd1lh';
\Midtrans\Config::$isProduction = false; // Set false untuk Sandbox
\Midtrans\Config::$isSanitized = true;
\Midtrans\Config::$is3ds = true;

try {
    // Get raw POST data
    $raw_input = file_get_contents('php://input');
    
    // Parse JSON input
    $data = json_decode($raw_input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // Validate required fields
    $required_fields = ['name', 'email', 'phone', 'items', 'total'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Missing or empty required field: {$field}");
        }
    }

    // Format items for Midtrans
    $items = array_map(function($item) {
        return [
            'id' => 'ITEM-' . substr(md5(uniqid()), 0, 8),
            'price' => (int)$item['price'],
            'quantity' => (int)$item['quantity'],
            'name' => strip_tags($item['name'])
        ];
    }, $data['items']);

    // Generate order ID
    $order_id = 'ORDER-' . time() . '-' . substr(md5(uniqid()), 0, 8);

    // Setup transaction parameters
    $transaction_details = [
        'transaction_details' => [
            'order_id' => $order_id,
            'gross_amount' => (int)$data['total']
        ],
        'customer_details' => [
            'first_name' => strip_tags($data['name']),
            'email' => $data['email'],
            'phone' => $data['phone']
        ],
        'item_details' => $items
    ];

    // Get Snap Token
    $snapToken = \Midtrans\Snap::getSnapToken($transaction_details);

    // Send success response
    echo json_encode([
        'success' => true,
        'token' => $snapToken,
        'order_id' => $order_id
    ]);

} catch (Exception $e) {
    // Send error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>