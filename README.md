generate_pdf.php
<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/constants.php';

use Mpdf\Mpdf;

/* =========================================================
MPDF CONFIG
========================================================= */

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_top' => 0,
    'margin_bottom' => 0,
    'margin_left' => 0,
    'margin_right' => 0,
]);

$mpdf->simpleTables = true;
$mpdf->packTableData = true;
$mpdf->shrink_tables_to_fit = 0;










//  <tr class="pricing-row">

//                             <td class="price-label">
//                                 Adults
//                             </td>

//                             <td class="price-value">
//                                 ' . $quotation['pax'] . '
//                             </td>

//                         </tr>


                        

// ';


// if ($quotation['extra_adult'] > 0) {

//     $html .= '

//                         <!-- EXTRA ADULT -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Extra Adult
//                             </td>

//                             <td class="price-value">
//                                 ' . $quotation['extra_adult'] . '
//                             </td>

//                         </tr>

// ';
// }


// if ($quotation['child'] > 0) {

//     $html .= '

//                         <!-- CHILD -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Child With Bed
//                             </td>

//                             <td class="price-value">
//                                 ' . $quotation['child'] . '
//                             </td>

//                         </tr>

// ';
// }


// $html .= '

                      

//                         <!-- PRICE PER PERSON -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Price Per Person
//                             </td>

//                             <td class="price-value">
//                                 ₹ ' . number_format($pricePerPerson) . '
//                             </td>

//                         </tr>

// ';





// $html .= '

//                         <!--  ADULT PRICE -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Adult Price
//                             </td>

//                             <td class="price-value">
//                                 ₹ ' . number_format($adultPersonPricing) . '
//                             </td>

//                         </tr>';



// if ($quotation['extra_adult'] > 0) {



//     $html .= '

//                         <!-- EXTRA ADULT PRICE -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Extra Adult Price
//                             </td>

//                             <td class="price-value">
//                                 ₹ ' . number_format($extraAdultTotalPrice) . '
//                             </td>

//                         </tr>

// ';
// }


// if ($quotation['child'] > 0) {



//     $html .= '

//                         <!-- EXTRA ADULT PRICE -->
//                         <tr class="pricing-row">

//                             <td class="price-label">
//                                 Extra Child Price
//                             </td>

//                             <td class="price-value">
//                                 ₹ ' . number_format($ChildBedTotalPrice) . '
//                             </td>

//                         </tr>

// ';
// }


// $html .= '

//                         <!-- TOTAL -->
//                         <tr class="pricing-row">

//                             <td valign="top">

//                                 <table cellpadding="0" cellspacing="0" border="0">

//                                     <tr>

//                                         <td class="total-label">
//                                             Total Price
//                                         </td>

//                                     </tr>

//                                     <tr>

                                     

//                                     </tr>

//                                 </table>

//                             </td>

//                             <td valign="top" class="total-price">
//                                 ₹ ' . number_format($quotation['total_price']) . '
//                             </td>

//                         </tr>













include 'db.php';
session_start();
// if (!isset($_SESSION['logged_in'])) {
//     header('Location: login.php');
//     exit;
// }
$transferperperson2 = 0;
$watermark = __DIR__ . 'uploads/6a450f687ae57.png';


$sql = "SELECT * FROM sitedetails ORDER BY created_at DESC LIMIT 1";
$result = mysqli_query($conn, $sql);
$site = mysqli_fetch_assoc($result);


// Fetch user info
$totalcabprice = 0;
$finalPrice2 = 0;
$user_id = $_SESSION['id'];
$stmt = $conn->prepare("SELECT name, email, phone,logo,role FROM register WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$userResult = $stmt->get_result();
$user = $userResult->fetch_assoc();
$user_name = $user['name'] ?? "Not Available";
$phone = $user['phone'] ?? "Not Available";
$email = $user['email'] ?? "Not Available";
$role = $user['role'] ?? 'Not Available';
$user_logo = $user['logo'] ?? '';
$pickDropDetails = [];
// Create PDF


if ($role == 'Agent') {
    // --- ADDITIONAL IMAGE ON TOP ---
    $user_logo = 'uploads/agents/' . $user_logo; // Top image

    $companyName = "";
} else {
    $user_logo = 'images/logo-rounded.png'; // Top image
    $companyName = $site['name'];
    $phone = $site['phone'];
    $email = $site['email'];
}
// --- HEADER BOX WITH LOGO AND INFO ---
// Logo Setup
$logo = 'images/Curiosity.logo.png';
$logo_width = 30;
$logo_x = 15;


// Text (Name, Phone, Email) Setup

$padding = 2;

/* =========================================================
VISIBLE WATERMARK
========================================================= */





if (isset($_SESSION['quotation_id'])) {
    $id = mysqli_real_escape_string($conn, $_SESSION['quotation_id']);
    $qsql = "SELECT q.*, v.* FROM quatation q LEFT JOIN vehicle v ON q.vehicle_id = v.id WHERE q.id = '$id'";
    $qresult = mysqli_query($conn, $qsql);

    while ($row = mysqli_fetch_assoc($qresult)) {

        $guestname = $row['guestName'];
        $extraAdult = $row['extraAdult'];
        $pax = $row['pax'];
        $vehicleQuantity = $row['vehicleQuantity'];
        $travelMonth = $row['travelMonth'];
        $userId = $row['register_id'];
        $mealPlan = $row['mealPlan'];
        $markup = $row['markup'];
        $totalmarkup = $row['totalMarkup'];
        $nights = $row['nights'];
        $childBed = $row['childBed'];

        $extraBedPrice = 0;
        $extraAdultCost = 0;


        // Fetching meal plan name
        $mealsql = "SELECT p.mealPlan FROM quatation q 
                JOIN plan p ON q.mealPlan = p.id WHERE q.id = '$id'";
        $mealresult = mysqli_query($conn, $mealsql);
        $mealData = mysqli_fetch_assoc($mealresult);
        $mealPlanName = $mealData['mealPlan'];

        // --- Fetch City List first ---
        $sqlCities = "SELECT c.city_name, qc.city_id, qc.nights 
          FROM quatation_cities qc 
          JOIN city c ON qc.city_id = c.id 
          WHERE qc.quotation_id = '$id' 
          ORDER BY qc.id ASC";
        $resultCities = mysqli_query($conn, $sqlCities);

        $citiesInOrder = [];
        while ($city = mysqli_fetch_assoc($resultCities)) {
            $citiesInOrder[] = [
                'id' => $city['city_id'],
                'name' => $city['city_name'],
                'nights' => $city['nights']
            ];
        }
        $cityCount = count($citiesInOrder);

        $cityNamesString = implode(", ", array_column($citiesInOrder, 'name')); // City1, City2, City3


        $sqlHotels = "
SELECT
    c.id AS city_id,
    c.city_name, 
    s.state_name,

    h.id AS hotel_id, 
    h.name AS hotel_name,

    COALESCE(hp.price, 0) AS hotel_price_per_nights,
    COALESCE(qh.rooms, 0) AS rooms,

    COALESCE(hebp.extrabedprice, 0) AS extrabedprice,
    COALESCE(hcbp.childbedprice, 0) AS childbedprice,

    h.hotel_front_image,
    h.bedroom_image,

    qh.mealPlan AS meal_plan,
    p.mealplan AS meal_plan_name,

    qc.nights AS city_nights,
    h.rating,

    COALESCE(qh.total_price, 0) AS total_price,
    COALESCE(qh.totalextrabedprice, 0) AS total_extra_bed_price,
    COALESCE(qh.totalchildbedprice, 0) AS total_child_bed_price

FROM quatation_cities qc

JOIN city c ON qc.city_id = c.id
JOIN state s ON c.state_id = s.id
JOIN quatation q ON qc.quotation_id = q.id

LEFT JOIN quatation_hotels qh 
    ON qh.quotation_id = qc.quotation_id 
    AND qh.city_id = qc.city_id
    AND qh.mealPlan = '$mealPlan'

LEFT JOIN hotel h 
    ON qh.hotel_id = h.id

LEFT JOIN hotel_prices hp 
    ON h.id = hp.hotel_id 
    AND hp.mealplan_id = qh.mealPlan 
    AND hp.month = '$travelMonth'

LEFT JOIN hotel_extra_bed_price hebp 
    ON qh.hotel_id = hebp.hotel_id 
    AND hebp.mealplan_id = qh.mealPlan

LEFT JOIN hotel_child_bed_price hcbp 
    ON qh.hotel_id = hcbp.hotel_id 
    AND hcbp.mealplan_id = qh.mealPlan

LEFT JOIN plan p 
    ON p.id = qh.mealPlan

WHERE qc.quotation_id = '$id'

ORDER BY qc.id ASC
";

        $resultHotels = mysqli_query($conn, $sqlHotels);
        $cityHotels = [];
        // while ($hotel = mysqli_fetch_assoc($resultHotels)) {
        //     $cityHotels[$hotel['city_id']][] = $hotel;
        // }


        while ($hotel = mysqli_fetch_assoc($resultHotels)) {

            $cityId  = $hotel['city_id'];
            $hotelId = $hotel['hotel_id'];

            if (!isset($cityHotels[$cityId][$hotelId])) {
                $cityHotels[$cityId][$hotelId] = $hotel;
            }
        }


        // STEP 3: Fetch activity details grouped by city
        $sqlActivities = "
SELECT 
    a.name,
    a.image,
    a.image2,
    a.details,
    a.city_id,
    c.city_name,
    qa.notes,
    qa.activity_date

FROM quatation_activities qa 

LEFT JOIN activity a 
    ON qa.activity_id = a.id 

LEFT JOIN city c 
    ON a.city_id = c.id 

WHERE qa.quotation_id = '$id'

GROUP BY qa.id

ORDER BY
    qa.activity_date ASC,
    qa.sort_order ASC,
    qa.id ASC
";

        // 
        $resultActivities = mysqli_query($conn, $sqlActivities);


        $cityActivities = [];
        while ($activity = mysqli_fetch_assoc($resultActivities)) {

            $cityActivities[$activity['city_id']][] = $activity;
        }

        $boxCount = 0;
        // ========== STEP 4A: Show all HOTELS city by city ==========
        // ========== STEP 4: Show HOTELS and ACTIVITIES city by city ==========

        foreach ($citiesInOrder as $city) {
            $cityId = $city['id'];
            $cityName = $city['name'];
            $nights = $city['nights'];

            $hotels = isset($cityHotels[$cityId]) ? $cityHotels[$cityId] : [];
            $activities = isset($cityActivities[$cityId]) ? $cityActivities[$cityId] : [];

            $boxesThisPage = 0;
            $maxBoxesPerPage = 3;
            $boxHeight = 80;
            $boxWidth = 190;
            $marginLeft = 10;
            /* =========================================================
VISIBLE WATERMARK
========================================================= */




            // ===== SHOW HOTEL (1 per city) =====
            if (!empty($hotels)) {
                if ($boxesThisPage >= $maxBoxesPerPage) {
                    $boxesThisPage = 0;
                }


                $hotel = reset($hotels);


                $boxesThisPage = 0;

                // Set starting positions
                $pageWidth = 210; // A4 width
                $margin = 15;
                $usableWidth = $pageWidth - 2 * $margin;

                // Hotel Image (big and centered)
                // $imagePath = 'uploads/hotels/' . $hotel['hotel_front_image'];
                // if (file_exists($imagePath)) {
                //     $imageWidth = 180; // Adjust to make it big but with margins
                //     $imageHeight = 90;
                //     $imageX = ($pageWidth - $imageWidth) / 2;
                //     $pdf->Image($imagePath, $imageX, $pdf->GetY(), $imageWidth, $imageHeight, '', '', '', true, 300);
                // }


                $imagePath = 'uploads/hotels/' . $hotel['hotel_front_image'];

                $imageWidth = 180;
                $imageHeight = 90;
                $imageX = ($pageWidth - $imageWidth) / 2;


                /* Check image exists */
                if (
                    !empty($hotel['hotel_front_image']) &&
                    file_exists($imagePath)
                ) {
                } else {
                }


                // Hotel Name

                $hotelicon = 'images/hotel-solid.png';
                if (file_exists(($hotelicon))) {
                }
                // Rooms Info
                $roomIcon = 'images/person-booth-solid.png';
                if (file_exists($roomIcon)) {
                }
                // Nights Info
                $nightIcon = 'images/moon-solid.png';
                if (file_exists($nightIcon)) {
                }
                $foodIcon = 'images/utensils-solid.png';
                if (file_exists($foodIcon)) {
                }
                $boxesThisPage++;
            }


            /* =========================================================
VISIBLE WATERMARK
========================================================= */


            // ===== SHOW ACTIVITIES =====
            if (!empty($activities)) {
                foreach ($activities as $index => $activity) {


                    $boxesThisPage = 0;

                    $pageWidth = 210; // A4 width
                    $margin = 15;
                    $usableWidth = $pageWidth - 2 * $margin;

                    // ===== Show Activity Image =====
                    $imagePath = 'uploads/activity image/' . $activity['image'];
                    if (file_exists($imagePath)) {
                        $imageWidth = 180;
                        $imageHeight = 90;
                        $imageX = ($pageWidth - $imageWidth) / 2;
                    }

                    $activityLogo = 'images/person-hiking-solid.png';
                    if (file_exists($activityLogo)) {
                        $iconSize = 8;
                    }

                    // ===== Activity Icon =====



                    $boxesThisPage++;
                }
            }
        }
        // ========== TRANSFERS SECTION (AFTER ALL CITIES) ==========

        $statesql = "SELECT state_id FROM quatation_cities WHERE quotation_id = '$id'";
        $stateresult = mysqli_query($conn, $statesql);
        $stateRow = mysqli_fetch_assoc($stateresult);
        $state = $stateRow['state_id'];
        // echo "State is : " . $state;
        // echo "<br>";
        //  if ($state == 4) {

        //  print_R($shownTransfers); exit;
        // } else {
        // 🔥 VEHICLE QUERY (Better: cast id to int for safety)

        $id = (int)$id;





  $sql = "
    SELECT 
    q.vehicle_id,
    vh.name AS vehicle_name,
    q.vehicleQuantity,
    vp.price,
    vp.month,
    s.name AS seater_name,
    q.pickup_id,
    q.drop_id,
    p.name AS pickup_name,
    d.name AS drop_name,
    qc.city_id,
    qc.state_id

FROM quatation q

INNER JOIN quatation_cities qc
    ON qc.quotation_id = q.id

INNER JOIN vehicle vh
    ON vh.id = q.vehicle_id

LEFT JOIN vehicle_price vp
    ON vp.vehicle_id = q.vehicle_id
    AND vp.state_id  = qc.state_id
    AND vp.pickup_id = q.pickup_id
    AND vp.drop_id   = q.drop_id

LEFT JOIN seater s
    ON s.id = vp.seater_id

LEFT JOIN pickupdrop p
    ON p.id = q.pickup_id

LEFT JOIN pickupdrop d
    ON d.id = q.drop_id

WHERE q.id  = ?

    LIMIT 1
";

        $pickDropDetails = [];
        // ================= PREPARE =================
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            die("SQL Error: " . $conn->error);
        }

        // ================= BIND =================
        $stmt->bind_param("i", $id);

        // ================= EXECUTE =================
        $stmt->execute();
        $result = $stmt->get_result();

        // ================= CHECK =================
        if ($result && $result->num_rows > 0) {

            while ($row = $result->fetch_assoc()) {

                $vehicleName = htmlspecialchars($row['vehicle_name']);
                $price       = floatval($row['price']);
                $pickup3 = $row['pickup_id'];
                // echo $pickup3;
                // echo "<br>";
                $pickup1     = htmlspecialchars($row['pickup_name'] ?? '');
                $drop1       = htmlspecialchars($row['drop_name'] ?? '');
                // echo $drop1;
                // echo "<br>";
                $seater      = htmlspecialchars($row['seater_name'] ?? '');
                $qty         = intval($row['vehicleQuantity'] ?? 1);


                // ✅ DAYS
                $days = $nights + 1;

                // ✅ TOTAL
                $totalcabprice = $days * $price * $qty;


                $pickDropDetails = ['vehicle_name' => $vehicleName, 'price' => $price, 'pickup' => $pickup1, 'drop' => $drop1, 'seater' => $seater, 'qty' => $qty,'total_price' =>   $totalcabprice ];
            }
        } else {
            //echo "No vehicle data found!";
        }






    if ($state == 4) {

        $sqlPickupdrop = "
    SELECT 
        qt.pickup_id, 
        qt.drop_id, 
        p.name AS Pickupname, 
        d.name AS Dropname
    FROM quatation_transfers qt
    LEFT JOIN pickupdrop p ON p.id = qt.pickup_id
    LEFT JOIN pickupdrop d ON d.id = qt.drop_id
";

        $resultPickupDrop = mysqli_query($conn, $sqlPickupdrop);
        while ($pickupdroprow = mysqli_fetch_assoc($resultPickupDrop)) {
            $pickup = $pickupdroprow['Pickupname'];
            $drop = $pickupdroprow['Dropname'];
        }
        // echo "Pickup From : " . $pickup;
        // echo "<br>";
        // echo "Drop To : " . $drop;
        // echo "<br>";
    }










        // ================= QUERY =================
        $sql = "
SELECT 
    q.vehicle_id, 
    vh.name AS vehicle_name,
    q.vehicleQuantity, 
    v.price,
    q.nights,
    s.name AS seater_name,

    v.pickup_id, 
    v.drop_id,

    p.name AS pickup_name, 
    d.name AS drop_name,

    qc.city_id,
    qc.state_id

FROM quatation q

-- ✅ CITY JOIN
JOIN quatation_cities qc 
    ON qc.quotation_id = q.id

-- ✅ VEHICLE
JOIN vehicle vh
    ON vh.id = q.vehicle_id

-- ✅ VEHICLE PRICE
JOIN vehicle_price v 
    ON v.vehicle_id = q.vehicle_id
    AND v.state_id = qc.state_id

    -- ✅ FIX MONTH 01 = 1
    AND v.month = (q.travelMonth + 0)

    -- ✅ MATCH PICKUP / DROP
    AND v.pickup_id = q.pickup_id
    AND v.drop_id   = q.drop_id

-- ✅ SEATER
LEFT JOIN seater s 
    ON s.id = v.seater_id

-- ✅ PICKUP
LEFT JOIN pickupdrop p 
    ON v.pickup_id = p.id

-- ✅ DROP
LEFT JOIN pickupdrop d 
    ON v.drop_id = d.id

WHERE q.id = ?

-- ✅ REMOVE DUPLICATES
GROUP BY 
    q.vehicle_id, 
    v.pickup_id, 
    v.drop_id, 
    v.seater_id,
    qc.city_id

LIMIT 1
";

        // ================= PREPARE =================
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            die("SQL Error: " . $conn->error);
        }

        // ================= EXECUTE =================
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        // ================= LOOP =================
        if ($result && $result->num_rows > 0) {

            while ($row = $result->fetch_assoc()) {

                $vehicleName = htmlspecialchars($row['vehicle_name']);
                $price       = floatval($row['price']);
                $pickup1     = htmlspecialchars($row['pickup_name'] ?? '');
                $drop1       = htmlspecialchars($row['drop_name'] ?? '');
                $seater      = htmlspecialchars($row['seater_name'] ?? '');
                $qty         = intval($row['vehicleQuantity'] ?? 1);
                $nights = $row['nights'];

                // ✅ DAYS
                $days = $nights + 1;



                // ✅ TOTAL
                $totalcabprice = $days * $price * $qty;

                // ================================
                // ✅ PAGE BREAK CHECK
                // ================================


                // ================================
                // 🚗 VEHICLE TITLE
                // ================================

                $title = $vehicleName . " - " . $nights . " Nights / " . $days . " Days";
                if (!empty($seater)) {
                    $title .= " (Seater: $seater)";
                }



                if ($qty > 1) {
                    //                        $pdf->Cell(0, 6, "Vehicles: " . $qty, 0, 1);
                }
          $pickDropDetails = ['vehicle_name' => $vehicleName, 'price' => $price, 'pickup' => $pickup1, 'drop' => $drop1, 'seater' => $seater, 'qty' => $qty,'total_price' =>   $totalcabprice ];
      
                // ================================
                // 💰 PRICE (Optional)
                // ================================
                /*
        $pdf->Cell(0, 6, "Price Per Day: ₹ " . number_format($price, 2), 0, 1);
        $pdf->Cell(0, 6, "Total: ₹ " . number_format($totalcabprice, 2), 0, 1);
        */

                // ================================
                // 🔽 SPACING
                // ================================
            }
        }
        //}


        if ($cityCount == 1) {

            $sqlTransfersDetails = "SELECT 
        t.name AS transfername, 
        tscp.price,
        v.name AS vehiclename,
        p.name AS pickup_name,
        d.name AS drop_name,
         s.name AS seater_name
    FROM quatation_transfers qt 
    JOIN transfer t ON qt.transfer_id = t.id 
    JOIN transfer_single_city_price tscp 
        ON qt.transfer_id = tscp.transfer_id
        AND qt.vehicle_id = tscp.vehicle_id
    JOIN vehicle v ON tscp.vehicle_id = v.id
    LEFT JOIN pickupdrop p ON qt.pickup_id = p.id
    LEFT JOIN pickupdrop d ON qt.drop_id = d.id
    LEFT JOIN seater s ON qt.seater = s.id
    WHERE qt.quotation_id = '$id'
    AND tscp.city_id = '$cityId'";
        } else {

            $sqlTransfersDetails = "SELECT 
        t.name AS transfername, 
        tvc.price, 
        v.name AS vehiclename, 
        s.name AS seater_name,
        p.name AS pickup_name,
        d.name AS drop_name
    FROM quatation_transfers qt 
    JOIN transfer t ON qt.transfer_id = t.id 
    JOIN transfer_vehicle_price tvc 
        ON qt.transfer_id = tvc.transfer_id 
        AND qt.vehicle_id = tvc.vehicle_id
    JOIN vehicle v ON tvc.vehicle_id = v.id
    LEFT JOIN seater s ON qt.seater = s.id
    LEFT JOIN pickupdrop p ON qt.pickup_id = p.id
    LEFT JOIN pickupdrop d ON qt.drop_id = d.id
    WHERE qt.quotation_id = '$id'";
        }
        $resultTransfersDetails = mysqli_query($conn, $sqlTransfersDetails);


        //             $shownTransfers = [];

        //             while ($transfer = mysqli_fetch_assoc($resultTransfersDetails)) {

        //                 $transferKey =
        //                     $transfer['transfername'] . '_' .
        //                     $transfer['vehiclename'];

        //                 if (!in_array($transferKey, $shownTransfers)) {

        //                     $pickup = $transfer['pickup_name'] ?? '';
        //                     $drop   = $transfer['drop_name'] ?? '';

        //   $transfers[] = [

        //                 'vehicle' => $vehicle,
        //                 'price' => $price,
        //                 'transfer' =>  $name,

        //                 'pickup' => $pickup,

        //                 'drop' => $drop,
        //                 'seater' =>  $seater
        //             ];

        //                     $shownTransfers[] = $transferKey;
        //                 }
        //             }



        $sqlHotelsTotal = "SELECT SUM(total_price) AS total_sum FROM quatation_hotels WHERE quotation_id = '$id'";
        $resultHotelsTotal = mysqli_query($conn, $sqlHotelsTotal);
        $hotelTotalPrice = mysqli_fetch_assoc($resultHotelsTotal)['total_sum'] ?? 0;


        $roomMultiplier = 1; //max(1, ($pax / 2));

        $hotelTotalPrice = $hotelTotalPrice * $roomMultiplier;

        // echo "Hotel Total Price : " . $hotelTotalPrice;
        // echo "<br>";

        $hotelextrabedprice = "SELECT SUM(totalextrabedprice) AS finalextrabedprice FROM quatation_hotels WHERE quotation_id = '$id'";
        $resulthotelextrabed = mysqli_query($conn, $hotelextrabedprice);
        $ExtrabedTotalprice = mysqli_fetch_assoc($resulthotelextrabed)['finalextrabedprice'] ?? 0;
        // echo "Total Extra Bed Price : " . $ExtrabedTotalprice;
        // echo "<br>";

        $hotelchildbedprice = "SELECT SUM(totalchildbedprice) AS finalchildbedprice FROM quatation_hotels WHERE quotation_id = '$id'";
        $resulthotelchildbed = mysqli_query($conn, $hotelchildbedprice);
        $ChildbedTotalprice = mysqli_fetch_assoc($resulthotelchildbed)['finalchildbedprice'] ?? 0;
        // echo "Total Child Bed Price : " . $ChildbedTotalprice;
        // echo "<br>";

        // Display the total price of all hotels
        $sqlActivities = "SELECT SUM(a.price) as total FROM quatation_activities qa 
JOIN activity a ON qa.activity_id = a.id 
WHERE qa.quotation_id = '$id'";
        $resultActivities = mysqli_query($conn, $sqlActivities);
        $activityTotalPrice = mysqli_fetch_assoc($resultActivities)['total'] ?? 0;
        // echo "Activity Price : " . $activityTotalPrice;
        // echo "<br>";

        // $sqlActivityTransfer = "SELECT 
        //                             SUM(sedan_price) AS total_sedan_price,
        //                             SUM(suv_price) AS total_suv_price,
        //                             SUM(van_price) AS total_van_price,
        //                             SUM(dzire_price) AS total_dzire_price,
        //                             SUM(innova_price) AS total_innova_price,
        //                             SUM(winger_price) AS total_winger_price,
        //                             SUM(tempo_price) AS total_tempo_price,
        //                             SUM(bus_price) AS total_bus_price
                                    
        //                         FROM (
        //                             SELECT 
        //                                 MAX(CASE WHEN av.vehicle_id = 4 THEN av.transfer_price END) AS sedan_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 5 THEN av.transfer_price END) AS suv_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 6 THEN av.transfer_price END) AS van_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 7 THEN av.transfer_price END) AS dzire_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 8 THEN av.transfer_price END) AS innova_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 9 THEN av.transfer_price END) AS winger_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 10 THEN av.transfer_price END) AS tempo_price,
        //                                 MAX(CASE WHEN av.vehicle_id = 11 THEN av.transfer_price END) AS bus_price
        //                             FROM quatation_activities qa  
        //                             LEFT JOIN activity_vehicle av 
        //                                 ON qa.activity_id = av.activity_id 
        //                                 AND qa.vehicle_id = av.vehicle_id  -- Ensure vehicle_id is matched
        //                             WHERE qa.quotation_id = '$id'
        //                             GROUP BY qa.activity_id
        //                         ) AS vehicle_prices";


        // $resultActivityTransfer = mysqli_query($conn, $sqlActivityTransfer);
        // $row = mysqli_fetch_assoc($resultActivityTransfer);

        // $etiosPrice = $row['total_sedan_price'] ?? 0;
        // $ertigaPrice = $row['total_suv_price'] ?? 0;
        // $cristaPrice = $row['total_van_price'] ?? 0;
        // $dzirePrice = $row['total_dzire_price'] ?? 0;
        // $innovaPrice = $row['total_innova_price'] ?? 0;
        // $wingerPrice = $row['total_winger_price'] ?? 0;
        // $tempoPrice = $row['total_tempo_price'] ?? 0;
        // $busPrice = $row['total_bus_price'] ?? 0;
        // echo "Etios Total Price : " . $etiosPrice;
        // echo "<br>";
        // echo "Ertiga Total Price : " . $ertigaPrice;
        // echo "<br>";
        // echo "Crista Total Price : " . $cristaPrice;
        // echo "<br>";
        // echo "Dzire - Ac Total Price : " . $dzirePrice;
        // echo "<br>";
        // echo "Innova - Ac Total Price : " . $innovaPrice;
        // echo "<br>";
        // echo "Winger - Ac Total Price : " . $wingerPrice;
        // echo "<br>";
        // echo "Tempo Traveller - Ac Total Price : " . $tempoPrice;
        // echo "<br>";
        // echo "Bus - Ac Total Price : " . $busPrice;
        // echo "<br>";
        
        
        
$sqlActivityTransfer = "
    SELECT SUM(price) AS grand_total
    FROM (
        SELECT
            qa.activity_id,
            qa.vehicle_id,
            MAX(av.transfer_price) AS price
        FROM quatation_activities qa
        LEFT JOIN activity_vehicle av
            ON qa.activity_id = av.activity_id
            AND qa.vehicle_id = av.vehicle_id
        WHERE qa.quotation_id = '$id'
        GROUP BY qa.activity_id, qa.vehicle_id
    ) t
";

$resultActivityTransfer = mysqli_query($conn, $sqlActivityTransfer);
$row = mysqli_fetch_assoc($resultActivityTransfer);

$grandActivityVehicleGrandTotal = $row['grand_total'] ?? 0;


        if ($cityCount == 1) {

            $sqlTransfers = "
        SELECT tscp.price AS total 
        FROM quatation_transfers qt
        JOIN transfer_single_city_price tscp 
            ON qt.transfer_id = tscp.transfer_id
            AND qt.vehicle_id = tscp.vehicle_id
        WHERE qt.quotation_id = '$id'
        AND tscp.city_id = '$cityId'
    ";
        } else {

            // ✅ MULTIPLE CITY
            $sqlTransfers = "
        SELECT tvp.price AS total 
        FROM quatation_transfers qt
        JOIN transfer_vehicle_price tvp 
            ON qt.transfer_id = tvp.transfer_id 
            AND qt.vehicle_id = tvp.vehicle_id
        WHERE qt.quotation_id = '$id'
    ";
        }
        $resultTransfers = mysqli_query($conn, $sqlTransfers);
        $transferTotalPrice = mysqli_fetch_assoc($resultTransfers)['total'] ?? 0;
        // echo "Total Transfer Price : " . $transferTotalPrice;
        // echo "<br>";

        //if ($state != 4) {
        $totalTranferPrice = $totalcabprice;
        // echo "Total Transfer Price is : " . $totalTranferPrice;
        // echo "<br>";
        //  }

        $totalPeople = $pax + $extraAdult + $childBed;
        // echo "Total People : " . $totalPeople;
        // echo "<br>";


        $totalPrice = $activityTotalPrice * $totalPeople;
        // echo "Total Activity Price : " . $totalPrice;
        // echo "<br>";

        $totalTransfer = $transferTotalPrice  + $grandActivityVehicleGrandTotal;
        $totalTransfer2 = $totalTransfer * $vehicleQuantity;
        // echo "Total Transfer With Activity : " . $totalTransfer;
        // echo "<br>";
        // echo "Total Transfer With Activity with total Quantity of Vehicle : " . $totalTransfer2;
        // echo "<br>";

        $Price = $hotelTotalPrice  + $totalTransfer2 + $totalPrice;
        // echo "Total Price : " . $Price;
        // echo "<br>";

        if ($state != 4) {
            $Price = $hotelTotalPrice  + $totalTransfer2 + $totalPrice;
            // echo "Total Price : " . $Price;
            // echo "<br>";
        }

        $totalextraAdult = $ExtrabedTotalprice;
        // echo "Total Extra Adult Cost with Total Night : " . $totalextraAdult;
        // echo "<br>";
        $totalChildBed = $ChildbedTotalprice;
        // echo "Total Child Cost with Total Night : " . $totalChildBed;
        // echo "<br>";

        $registersql = "SELECT role, agentpercentage FROM register WHERE id = '$userId'";
        $resultRegister = mysqli_query($conn, $registersql);
        while ($rowregister = mysqli_fetch_assoc($resultRegister)) {
            $role = $rowregister['role'];
            $percentage = $rowregister['agentpercentage'];

            // echo "Role : " . $role;
            // echo "<br>";
            // echo "Agent Percentage : " . $percentage;
            // echo "<br>";

            $total = $Price + $totalextraAdult + $totalChildBed;

            // echo "<div class='quotation-total'>Total Final Price : &#8377;" . htmlspecialchars(number_format($total, 2)) . "</div>";
            // echo "<br>";

            $finalMarkup = 0;
            $agentMarkup = 0;
            $markupPerPerson = 0;
            $markup2 = 0;

            if ($role == 'Agent') {
                $total2 = ($total * $percentage) / 100;
                // echo "Agent Markup : " . $total2;
                // echo "<br>";
                $total3 = $total2 + $total;
                // echo "Total Price With Agent Markup : " . $total3;
                // echo "<br>";

                if ($markup == '%') {
                    $finalMarkup = ($total3 * $totalmarkup) / 100;
                    // echo "Markup : " . $finalMarkup;
                    // echo "<br>";
                } else {
                    $finalMarkup = $totalmarkup;
                    // echo "Markup : " . $finalMarkup;
                    // echo "<br>";
                }


                if ($markup == '%') {

                    $finalPrice = $total3 * $totalmarkup / 100;
                } else {

                    $finalPrice = $totalmarkup;
                }


                $finalPrice2 = $total3 + $finalPrice;
                $finalPrice3 = $total3 + $finalMarkup;
                // echo "Total Price : " . $finalPrice3;
                // echo "<br>";
                $markupPerPerson = $finalMarkup / $totalPeople;
                // echo "Markup Per Person : " . $markupPerPerson;
                // echo "<br>";
                $markup2 = $total2 / $totalPeople;
                // echo "Agent Markup Per Person : " . $markup2;
                // echo "<br>";
            } else {
                if ($markup == '%') {
                    $finalMarkup = ($total * $totalmarkup) / 100;
                     $finalPrice = ($total * $totalmarkup) / 100;
                    // echo "Markup : " . $finalMarkup;
                    // echo "<br>";
                } else {
                    $finalMarkup = $totalmarkup;
                     $finalPrice = $totalmarkup;
                    // echo "Markup : " . $finalMarkup;
                    // echo "<br>";
                }
                
      


                $finalPrice2 = $total + $finalMarkup;
                // echo "Total Price : " . $finalPrice3;
                // echo "<br>";

                $markupPerPerson = $finalMarkup / $totalPeople;
                // echo "Markup Per Person : " . $markupPerPerson;
                // echo "<br>";
            }



            $activitychargesperperson = $totalPrice / $totalPeople;
            // echo "Activity Charges Per Person : " . $activitychargesperperson;
            // echo "<br>";

            $hotelCharges = $hotelTotalPrice;
            // echo "Hotel Charges : " . $hotelCharges;
            // echo "<br>";

            $hotelchargesperperson = $hotelCharges / ($totalPeople - $extraAdult - $childBed);
            // echo "Total Hotel Price Per Person without extra bed : " . $hotelchargesperperson;
            // echo "<br>";
            $transferperperson = $totalTransfer2;
            $transferchargesperperson = $transferperperson / $totalPeople;
            // echo "Total Transfer Per Person : " . $transferchargesperperson;
            // echo "<br>";

            if ($state != 4) {
                $transferperperson2 = $totalcabprice / $totalPeople;
                // echo "Total Transfer Per Person : ". $transferperperson2;
                // echo "<br>";
            }

            if ($state != 4) {
                $perperson = $activitychargesperperson
                    + $hotelchargesperperson
                    + $transferchargesperperson
                    + $markupPerPerson
                    + $markup2
                    + $transferperperson2;
            } else {
                $perperson = $activitychargesperperson
                    + $hotelchargesperperson
                    + $transferchargesperperson
                    + $markupPerPerson
                    + $markup2;
            }

            if ($extraAdult > 0) {

                $extraAdultTotalPrice = $totalextraAdult;
            } else {

                $extraAdultTotalPrice = 0;
            }

            if ($childBed > 0) {

                $ChildBedTotalPrice =
                    ($totalChildBed);
            } else {

                $ChildBedTotalPrice = 0;
            }

            $totalPrice = $perperson * ($totalPeople - $extraAdult);



            // Set Background Image for Full Page

            $imagePath = 'images/19.jpg'; // Your actual image path

            // Set only desired image height
            $imageHeight = 297; // mm (full A4 page height)



            // Get original image size in pixels
            list($imgWidthPx, $imgHeightPx) = getimagesize($imagePath);

            // Calculate aspect ratio
            $aspectRatio = $imgWidthPx / $imgHeightPx;

            // Calculate width in mm based on fixed height
            $imageWidth = 250;






            $boxWidth = 130;
            $boxHeight = 100; // Adjusted to fit background image
            $boxPadding = 10;
            $contentWidth = $boxWidth - (2 * $boxPadding);


            // Background image
            $imagePath = 'images/2.jpg';

            // White semi-transparent overlay

            $radius = 5; // Adjust corner radius as needed



            // Starting position inside background box

            $lineHeight = 10;
            $padding = 4;

            // Define fixed cell widths
            $labelWidth = 70;
            $amountWidth = 26;

            // Calculate box height
            $boxContentHeight = $lineHeight + 10; // Per Person
            if ($extraAdult > 0) {
                $boxContentHeight += $lineHeight + 2;
            }
            $boxContentHeight += $lineHeight + 2; // Total Price
            $priceBoxHeight = $boxContentHeight + ($padding * 2);



            // Total Price
            $totalPrice = ($role == 'Agent' ? $finalPrice3 : $finalPrice2);
        }




        $content = "
• To ensure complete transparency, we've laid down a standard universal cancellation policy and terms 
applicable for all bookings made with us. Sometimes due to unforeseen circumstances, you may need 
to cancel or reschedule your booking. While we would want to extend all due consideration to your 
circumstances, but given airline, hotel and other supplier constraints and the nature of the industry we 
work in we are forced to collect the below cancellation fees as per the below policy.

• Please note that the hotel is solely responsible for providing all hotel services, including 
accommodations, amenities, and customer service. The travel agent acts solely as an intermediary and 
does not assume any liability or responsibility for the hotel services offered. Token amount is non 
refundable as we make all the bookings from this amount only. We strongly recommend that guests 
independently verify and check the hotel details, including facilities, location, room types, and any 
other relevant information, prior to making a booking. Any issues or concerns regarding the hotel 
services should be directly addressed with the hotel management. The travel agent shall not be held 
accountable for any dissatisfaction or inconvenience caused during the stay at the hotel.

• Please be aware that the airlines hold full responsibility for any changes, rescheduling, or cancellations 
of flights. The travel agent acts solely as an intermediary and shall not be held liable for any 
modifications made by the airlines to the flight schedule. In the event of any changes, rescheduling, or 
cancellations, we advise passengers to directly contact the airline to seek assistance and resolve any 
issues. The travel agent shall not be responsible for any inconvenience, losses, or additional costs 
incurred due to such airline-related changes. We recommend passengers to stay updated with their 
flight status and any notifications from the airline regarding their bookings.

• Please note that certain hotels may require a deposit or collect taxes at the time of check-in. This is a 
hotel policy and not within the control or responsibility of the travel agent. Customers are required to 
pay any applicable deposits or taxes directly to the hotel at the time of check-in. The deposit or security 
amount cannot be paid at the time of package booking and must be settled with the hotel upon arrival. 
The travel agent shall not be held accountable for any deposits, taxes, or security payments required by 
the hotel, and any disputes or concerns regarding such payments should be addressed directly with the 
hotel management.
";


        // Content

        $content = "
• 50% amount of package advance.

• Rest amount on completion of bookings.
";

        $content = "Important: The booking stands liable to be canceled if 100% payment is not received before 19 days 
from the date of departure. Booking policy is subject to change depending upon the travel period and 
destinations opted for. 100% payment may be required in advance for specific destinations or high 
end hotels.
";



        // Content

        $content = "30 days or before prior to the starting of the tour 15% of Package Cost
30 – 15 days prior to the starting of the tour 25% of Package Cost
15 – 07 days prior to the starting of the tour 50% of Package Cost 
In Case of No Show 100% of Package Cost
Govt charges will be not refundable
";

        $content = "Online Transaction Charges (2.5%) will not be refunded. Refund for hotel payment will follow the 
hotel’s cancellation policy, Train tickets cancellations will follow the Railway’s policy, Flight tickets
cancellations will follow the airlines company policy. In case you cancel the trip after commencement, 
refund would be restricted to a limited amount only, which too would depend on the amount that we 
would be able to recover from the hoteliers / contractors we, patronize. For unused hotel 
accommodation, chartered transportation & missed meals etc. we do not bear any responsibility to 
refund.
";


        // Output

    }
}













$transfers = [];
$shownTransfers = [];

if (!empty($resultTransfersDetails)) {
    mysqli_data_seek($resultTransfersDetails, 0);

    while ($transfer = mysqli_fetch_assoc($resultTransfersDetails)) {

        $transferKey = $transfer['transfername'] . '_' . $transfer['vehiclename'];

        if (!in_array($transferKey, $shownTransfers)) {

            $vehicle = htmlspecialchars($transfer['vehiclename']);
            $name    = htmlspecialchars($transfer['transfername']);
            $price   = htmlspecialchars($transfer['price']);
            $pickup2 = $transfer['pickup_name'];
            $drop2 = $transfer['drop_name'];
            $seater = '';
            if (!empty($transfer['seater_name'])) {
                $seater = htmlspecialchars($transfer['seater_name']);
            }

            $transfers[] = [

                'vehicle' => $vehicle,
                'price' => $price,
                'transfer' =>  $name,

                'pickup' => $pickup2,

                'drop' => $drop2,
                'seater' =>  $seater
            ];



            $shownTransfers[] = $transferKey;
        }
    }
}


//  $pickDropDetails = ['vehicle_name' => $vehicleName, 'price' => $price, 'pickup' => $pickup1, 'drop' => $drop1, 'seater' => $seater, 'qty' => $qty,'total_price' =>   $totalcabprice ];
      
        

// if(!empty($shownTransfers)){
//       $transfers[] = [

//                 'vehicle' => $vehicle,

//                 'transfer' => $name,

//                 'pickup' => $pickup2,

//                 'drop' => $drop2,

//                 'seater' =>  $seater
//             ];
// }




   $totalPax = $pax + $extraAdult + $childBed;

                // Hotel
                $adultHotelPrice = ($pax > 0)
                    ? ($hotelTotalPrice / $pax)
                    : 0;

                $extraAdultHotelPrice = ($extraAdult > 0)
                    ? ($ExtrabedTotalprice / $extraAdult)
                    : 0;

                $childHotelPrice = ($childBed > 0)
                    ? ($ChildbedTotalprice / $childBed)
                    : 0;

                // Transfer
                $transferShare = ($totalPax > 0)
                    ? ($transferTotalPrice / $totalPax)
                    : 0;

                // Cab Activity
                $cabActivityTotal =
                    $totalcabprice;


                //   print_R($totalcabprice); exit;

                $cabActivityTotal *= $vehicleQuantity;

                $cabActivityShare = 0;

                $activityVehicleShare = $grandActivityVehicleGrandTotal /   $totalPax;


                // Activity
                $activityShare = $activityTotalPrice;
                
                

                // Markup
                $markupShare = ($totalPax > 0)
                    ? ($finalPrice / $totalPax)
                    : 0;




                // ===============================
                // TOTALS
                // ===============================

                $adultPersonPricingWithMarkup =
                    (
                        $adultHotelPrice +
                        $transferShare +
                        $activityShare +
                        $markupShare +  $activityVehicleShare
                    ) * $pax;


                $extraAdultTotalPriceWithMarkup = $totalextraAdult;


                $ChildBedTotalPriceWithMarkup = $totalChildBed;





                $baseAdult =
                    $adultHotelPrice +
                    $transferShare +
                    $activityShare;

                $baseExtraAdult =
                    $extraAdultHotelPrice +
                    $transferShare +
                    $activityShare;

                $baseChild =
                    $childHotelPrice +
                    $transferShare +
                    $activityShare;

                $totalBase =
                    ($baseAdult * $pax) +
                    ($baseExtraAdult * $extraAdult) +
                    ($baseChild * $childBed);


                $markupMultiplier =  1; // ($totalBase > 0)
                // ? ($finalPrice2 / $totalBase)
                // : 1;


                $adultPersonPricing =
                    ($baseAdult * $markupMultiplier) * $pax;

                $extraAdultTotalPrice =
                    ($baseExtraAdult * $markupMultiplier) * $extraAdult;

                $ChildBedTotalPrice =
                    ($baseChild * $markupMultiplier) * $childBed;


                $grandTotal =
                    $adultPersonPricing +
                    $extraAdultTotalPrice +
                    $ChildBedTotalPrice;


                $pricePerPerson = $perperson;



$id = 'JHG578GBJKGH';



if (isset($_SESSION["quotation_id"])) {
    $id = mysqli_real_escape_string($conn, $_SESSION['quotation_id']);
    $qsql = "SELECT q.*, v.* FROM quatation q LEFT JOIN vehicle v ON q.vehicle_id = v.id WHERE q.id = '$id'";
    $qresult = mysqli_query($conn, $qsql);

    while ($row = mysqli_fetch_assoc($qresult)) {

        $guestname = $row['guestName'];
        $extraAdult = $row['extraAdult'];
        $pax = $row['pax'];
        $vehicleQuantity = $row['vehicleQuantity'];
        $travelMonth = $row['travelMonth'];
        $userId = $row['register_id'];
        $mealPlan = $row['mealPlan'];
        $markup = $row['markup'];
        $totalmarkup = $row['totalMarkup'];
        $nights = $row['nights'];
        $childBed = $row['childBed'];


        $quotation = [
            'quotation_id' => $id,
            'guest_name' => $guestname,
            'nights' => $nights,
            'meal_plan' => $mealPlanName,
            'travel_date' => $row['travelDate'],
            'travel_end_date' => $row['travelEndDate'],
            'rooms' => $row['rooms'],
            'pax' => $pax,
            'extra_adult' => $extraAdult,
            'child' => $childBed,
            'vehicle' => $row['name'],
            'total_vehicle' => $vehicleQuantity,
            'cities' => $cityNamesString,

            'total_price' => round($totalPrice),

            'per_person' => round($perperson),
            'total_person_count' => $pax + $childBed + $extraAdult,
            'extra_adult_price' => round($extraAdultTotalPrice ?? 0),

            'child_price' => round($ChildBedTotalPrice ?? 0),

            'user_photo' => $logo
        ];
    }
}



$hotels = [];

foreach ($cityHotels as $cityId => $hotelList) {
    foreach (array_values($hotelList) as $hotel) {

        $hotels[] = [
            'name' => $hotel['hotel_name'],
            'location' => $hotel['city_name'],
            'rooms' => $hotel['rooms'],
            'nights' => $hotel['city_nights'],
            'meal' => $hotel['meal_plan_name'],
            'rating' => $hotel['rating'],
            'image' =>
            !empty($hotel['hotel_front_image'])
                ? 'uploads/hotels/' . $hotel['hotel_front_image']
                : 'images/default-hotel.jpg'
        ];
    }
}
$activities = [];

foreach ($cityActivities as $cityId => $activityList) {
    foreach ($activityList as $activity) {

        $activities[] = [

            'title' => $activity['name'],

            'description' => $activity['details'],
            'activity_date' => $activity['activity_date'],
            'image' =>
            !empty($activity['image'])
                ? 'uploads/activity image/' . $activity['image']
                : 'images/default-activity.jpg'
        ];
    }
}
// $hotels = [
//     [
//         'name' => 'Sea View Resort',
//         'location' => 'Goa',
//         'rooms' => '1',
//         'nights' => '5',
//         'meal' => 'Breakfast + Dinner',
//         'image' => 'https://picsum.photos/900/500?1'
//     ],
//     [
//         'name' => 'Luxury Palm Resort',
//         'location' => 'North Goa',
//         'rooms' => '2',
//         'nights' => '4',
//         'meal' => 'MAP',
//         'image' => 'https://picsum.photos/900/500?2'
//     ]
// ];

// $activities = [
//     [
//         'title' => 'Scuba Diving',
//         'description' => 'Enjoy underwater adventures and premium guided experiences.',
//         'image' => 'https://picsum.photos/900/500?3'
//     ],
//     [
//         'title' => 'Beach Tour',
//         'description' => 'Experience premium beaches, nightlife and local attractions.',
//         'image' => 'https://picsum.photos/900/500?4'
//     ]
// ];

// $transfers = [
//     [
//         'vehicle' => 'Tempo Traveller',
//         'transfer' => 'Airport Pickup',
//         'pickup' => 'Goa Airport',
//         'drop' => 'Sea View Resort',
//         'seater' => '12 Seater'
//     ]
// ];



// $transfers = [];
// $shownTransfers = [];

if (!empty($resultTransfersDetails)) {
    mysqli_data_seek($resultTransfersDetails, 0);

    while ($transfer = mysqli_fetch_assoc($resultTransfersDetails)) {

        $transferKey = $transfer['transfername'] . '_' . $transfer['vehiclename'];

        if (!in_array($transferKey, $shownTransfers)) {

            $vehicle = htmlspecialchars($transfer['vehiclename']);
            $name    = htmlspecialchars($transfer['transfername']);
            $price   = htmlspecialchars($transfer['price']);
            $pickup2 = $transfer['pickup_name'];
            $drop2 = $transfer['drop_name'];
            $seater = '';
            if (!empty($transfer['seater_name'])) {
                $seater = htmlspecialchars($transfer['seater_name']);
            }

            $transfers[] = [

                'vehicle' => $vehicle,
                'price' => $price,
                'transfer' =>  $name,

                'pickup' => $pickup2,

                'drop' => $drop2,
                'seater' =>  $seater
            ];



            $shownTransfers[] = $transferKey;
        }
    }
}
// print_R($resultTransfersDetails); exit;
// if(!empty($shownTransfers)){
//       $transfers[] = [

//                 'vehicle' => $vehicle,

//                 'transfer' => $name,

//                 'pickup' => $pickup2,

//                 'drop' => $drop2,

//                 'seater' =>  $seater
//             ];
// }


?>



<?php



/* =========================================================
CSS
========================================================= */

$stylesheet = '

  body{
        margin:0;
        padding:0;
        font-family: dejavuserif;
        color:#ffffff;
    }

    .main-title{
    font-family:dejavuserif;
    font-style:italic;
    font-size:52px;
    font-weight:bold;
    color:#ffffff;
}

.guest-name{
    font-family:times;
    font-style:italic;
    font-size:42px;
    color:#21352b;
}
    .page{
        width:100%;
        height:100%;
        background:#000000;
    }

    .cover-bg{
        width:100%;
        height:1120px;
        background-image:url("images/pdf/first_page5.png");
        background-size:100% 100%;
    background-position:center top;
    background-repeat:no-repeat;
    }

    .overlay{
        background:rgba(0,0,0,0.55);
        width:100%;
        height:1120px;
    }

    .content-wrap{
        padding-left:65px;
        padding-right:65px;
        padding-top:320px;
    }

    .main-title{
        font-size:42px;
        font-weight:bold;
        color:#ffffff;
        letter-spacing:0.5px;
    }

    .ref-text{
        font-size:15px;
        color:#ffffff;
        padding-top:12px;
    }

    .line{
        border-top:1px solid #ffffff;
        margin-top:15px;
        margin-bottom:15px;
    }

    .info-table{
        width:100%;
    }

    .info-icon{
        width:28px;
        vertical-align:top;
    }

    .info-text{
        font-size:20px;
        color:#ffffff;
        padding-bottom:12px;
    }

    .footer-text{
        padding-top:30px;
        font-size:15px;
        line-height:28px;
        color:#ffffff;
    }

    .agency-name{
        font-weight:bold;
    }

.info-icon img{
    width:20px;
    margin-top:5px;
}


// page 2
.second-page-table{
    width:100%;
    height:1120px;
    border-collapse:collapse;
    background:#f3efe7;
}

.sidebar-td{
    width:150px;
    background:#d8cfc3;
}

.sidebar-img{
    width:150px;
    height:1120px;
}

.content-td{
    padding-top:70px;
    padding-left:45px;
    padding-right:55px;
    padding-bottom:60px;
    vertical-align:top;
}

.top-label{
    font-size:14px;
    color:#8d8478;
    letter-spacing:0.5px;
}

.guest-name{
    font-size:35px;
    font-weight:bold;
    color:#066168;
    padding-top:6px;
    padding-bottom:55px;
    text-transform:lowercase;
}

.prepared-title{
    font-size:14px;
    color:#8d8478;
    letter-spacing:0.5px;
}

.agent-name{
    font-size:25px;
    font-weight:bold;
    color:#066168;
    padding-top:8px;
}

.company-name{
    font-size:22px;
    color:#066168;
    padding-top:8px;
    padding-bottom:45px;
}

.contact-table{
    width:100%;
}

.contact-row td{
    padding-bottom:15px;
    vertical-align:middle;
}

.contact-text{
    font-size:15px;
    color:#4d4d4d;
}

.note-box{
    border-top:1px solid #cacaca;
    padding-top:35px;
    margin-top:80px;
    
}

.note-text{
    font-size:10px;
    line-height:30px;
    color: #c5c0c0;
}


// 3rd page


.itinerary-page{
    width:100%;
    height:1120px;
    background:#f3efe7;
    border-collapse:collapse;
}

.itinerary-content{
    padding-top:60px;
    padding-left:0px;
    padding-right:0px;
    padding-bottom:0px;
}

.page-title{
     font-size:42px;
    font-weight:bold;
    color:#066168;
    padding-left:60px;
    padding-right:60px;
    padding-bottom:40px;
}

.itinerary-table{
    width:100%;
    border-collapse:collapse;
}

.itinerary-head td{
    background:#066168;
    color:#ffffff;
    font-size:18px;
    font-weight:bold;
    padding:18px 16px;
}

.itinerary-row td{
    // background:#ffffff;
    padding:22px 16px;
     border-bottom:1px solid #acacac;
    vertical-align:top;
}

.date-col{
    width:210px;
    font-size:17px;
    font-weight:bold;
    color:#066168;
}

.product-col{
    width:120px;
    font-size:17px;
    font-weight:bold;
    color:#333333;
}

.desc-col{
    font-size:16px;
    line-height:28px;
    color:#555555;
}

.transfer-tag{
    display:inline-block;
    background:#e8f4f3;
    color:#066168;
    font-size:14px;
    padding:4px 10px;
    border-radius:4px;
    margin-top:8px;
}

.hotel-tag{
    display:inline-block;
    background:#f5efe5;
    color:#8b6f47;
    font-size:14px;
    padding:4px 10px;
    border-radius:4px;
    margin-top:8px;
}

.activity-tag{
    background:#dff4ea !important;
    color:#066168  !important;
    font-size:12px  !important;
    border-radius:12px  !important;
}

.activity-tag-red{
    background:#fde7e7 !important;
    color:#c0392b !important;
    font-size:12px !important;
    border-radius:12px !important;
}

.activity-tag-blue{
    background:#e8f1ff !important;
    color:#2f6fdb !important;
    font-size:12px !important;
    border-radius:12px !important;
}

.activity-tag td,
.activity-tag-red td,
.activity-tag-blue td{
    padding-top:5px !important;
    padding-bottom:5px !important;
    padding-left:12px !important;
    padding-right:12px !important;
        border-bottom: 0px !important; 
}


.itinerary-head td{
    background:#066168;
    color:#ffffff;
    font-size:18px;
    font-weight:bold;
    padding:18px 30px;
}

.itinerary-row td{
    // background:#ffffff;
    padding:22px 30px;
    // border-bottom:1px solid #e4ddd2;
    vertical-align:top;
}


// 5th page

.day-page{
    width:100%;
    height:1120px;
    border-collapse:collapse;
    background:#f3efe7;
}

.day-image{
    width:100%;
    height:420px;
}

.day-content{
    padding-left:60px;
    padding-right:60px;
    padding-top:45px;
    padding-bottom:40px;
}

.day-title{
    font-size:38px;
    font-weight:bold;
    color:#066168;
    line-height:52px;
    padding-bottom:28px;
}

.day-subtitle{
    font-size:24px;
    font-weight:bold;
    color:#1f1f1f;
    padding-bottom:30px;
}

.day-description{
    font-size:16px;
    line-height:30px;
    color:#625b52;
    padding-bottom:40px;
}

.info-box{
    width:100%;
    background:#ffffff;
    border:1px solid #e5ddd1;
}

.info-box td{
    padding:22px 25px;
    vertical-align:top;
}

.info-title{
    font-size:16px;
    font-weight:bold;
    color:#066168;
    padding-bottom:10px;
}

.info-text{
    font-size:15px;
    line-height:26px;
    color:#fff;
}

.meal-table{
    width:100%;
    margin-top:35px;
}

.meal-box{
    background:#ffffff;
    border:1px solid #e5ddd1;
}

.meal-box td{
    padding:18px 20px;
    vertical-align:middle;
}

.meal-title{
    font-size:15px;
    font-weight:bold;
    color:#066168;
    padding-top:6px;
}

.meal-status{
    font-size:15px;
    color:#5f5f5f;
    padding-top:4px;
}

// 6th page
.day6-page{
    width:100%;
    background:#ffffff;
    font-family:sans-serif;
}

.day6-header{
    background:#066168;
    background-image:url("images/pdf/pattern-bg.png");
    background-repeat:repeat;
}

.day6-header-text{
    color:#ffffff;
    font-size:20px;
    font-weight:bold;
    padding-top:18px;
    padding-bottom:18px;
    padding-left:28px;
}

.day6-content{
    padding-top:28px;
    padding-left:30px;
    padding-right:30px;
    padding-bottom:20px;
}

.day6-title{
    font-size:26px;
    line-height:34px;
    font-weight:bold;
    color:#222222;
    padding-bottom:18px;
}

.day6-description{
    font-size:14px;
    line-height:24px;
    color:#444444;
}

.space-20{
    height:20px;
}

.transfer-table{
    width:100%;
}

.transfer-icon{
    width:34px;
    vertical-align:top;
}

.transfer-content{
    vertical-align:top;
}

.transfer-title{
    font-size:15px;
    font-weight:bold;
    color:#222222;
    line-height:24px;
}

.transfer-tag{
    display:inline-block;
    background:#d8efcf;
    color:#5b8a46;
    font-size:11px;
    padding-top:3px;
    padding-bottom:3px;
    padding-left:10px;
    padding-right:10px;
    border-radius:10px;
}

.transfer-time{
    font-size:12px;
    color:#777777;
    line-height:20px;
}

.meals-table{
    width:100%;
}

.meal-col{
    width:33%;
    vertical-align:top;
}

.meal-title{
    font-size:14px;
    color:#777777;
    padding-top:5px;
}

.meal-status{
    font-size:13px;
    color:#bbbbbb;
    padding-top:3px;
}

.footer-space{
    height:420px;
}


// 8th page 

.hotel-page{
    width:100%;
    background:#ffffff;
}

.hotel-header{
    background:#066168;
}

.hotel-header td{
    padding-top:18px;
    padding-bottom:18px;
    padding-left:28px;
    padding-right:28px;
}

.hotel-location{
    font-size:16px;
    color:#ffffff;
    font-weight:bold;
}

.hotel-duration{
    font-size:14px;
    color:#d9f0ee;
}

.hotel-content{
    padding-top:25px;
    padding-left:20px;
    padding-right:20px;
    padding-bottom:25px;
}

.hotel-image-col{
    width:230px;
    vertical-align:top;
}

.hotel-image{
    width:210px;
    height:140px;
    margin-bottom:10px;
}

.hotel-info-col{
    vertical-align:top;
    padding-left:18px;
}

.hotel-title{
    font-size:28px;
    font-weight:bold;
    color:#222222;
    padding-bottom:5px;
}

.hotel-address{
    font-size:13px;
    color:#666666;
    padding-bottom:15px;
}

.hotel-date-table{
    width:100%;
    margin-bottom:18px;
}

.hotel-date-title{
    font-size:12px;
    color:#666666;
}

.hotel-date-value{
    font-size:14px;
    font-weight:bold;
    color:#222222;
}

.hotel-night-box{
    background:#f2f5f5;
    text-align:center;
    border-radius:4px;
}

.hotel-night-box td{
    padding-top:10px;
    padding-bottom:10px;
}

.hotel-night-number{
    font-size:18px;
    font-weight:bold;
    color:#066168;
}

.hotel-night-text{
    font-size:12px;
    color:#666666;
}

.hotel-description{
    font-size:13px;
    line-height:23px;
    color:#444444;
    padding-bottom:20px;
}

.room-box{
    background:#f7f7f7;
    border-left:4px solid #066168;
}

.room-box td{
    padding:14px;
}

.room-title{
    font-size:15px;
    font-weight:bold;
    color:#222222;
}

.room-text{
    font-size:13px;
    line-height:22px;
    color:#555555;
}

.hotel-footer{
    padding-top:40px;
    font-size:12px;
    color:#777777;
}
    .hotel-stars{
    padding-bottom:8px;
}

.star{
    color:#d4a017;
    font-size:16px;
    letter-spacing:1px;
}




// 12th page
.day-page{
    width:100%;
    background:#ffffff;
}

.day-header{
    background:#066168;
}

.day-header td{
    padding-top:14px;
    padding-bottom:14px;
    padding-left:22px;
    padding-right:22px;
}

.day-header-text{
    font-size:20px;
    font-weight:bold;
    color:#ffffff;
}

.day-content{
    padding-top:28px;
    padding-left:28px;
    padding-right:28px;
}

.day-title{
    font-size:28px;
    font-weight:bold;
    color:#222222;
    line-height:38px;
    padding-bottom:18px;
}

.day-description{
    font-size:14px;
    line-height:24px;
    color:#444444;
    padding-bottom:25px;
}

.activity-table{
    width:100%;
}

.activity-icon{
    width:26px;
    vertical-align:top;
}

.activity-content{
    vertical-align:top;
}

.activity-title{
    font-size:15px;
    font-weight:bold;
    color:#222222;
    line-height:22px;
}

.activity-time{
    font-size:12px;
    color:#777777;
    line-height:18px;
    padding-top:3px;
}

.activity-tag{
    background:#dff4ea;
    color:#066168;
    font-size:11px;
    padding-top:3px;
    padding-bottom:3px;
    padding-left:10px;
    padding-right:10px;
}

.space-row{
    height:22px;
}

.meal-section{
    padding-top:18px;
}

.meal-col{
    width:33%;
    vertical-align:top;
}

.meal-title{
    font-size:14px;
    color:#777777;
    padding-top:5px;
}

.meal-text{
    font-size:13px;
    color:#b0b0b0;
}

.hotel-row{
    padding-top:16px;
}

.hotel-text{
    font-size:14px;
    color:#333333;
}

.footer-space{
    height:420px;
}


// 14th page

.pricing-page{
    width:100%;
    background:#ffffff;
}

.pricing-left{
    width:200px;
    background:#066168;
    vertical-align:top;
    height:1200px;
}

.pricing-right{
    vertical-align:top;
}

.left-pattern{
    width:95px;
    height:1120px;
}

.pricing-content{
    padding-top:110px;
    padding-left:80px;
    padding-right:80px;
}

.pricing-title{
    font-size:42px;
    font-weight:bold;
    color:#1d3b2f;
    padding-bottom:55px;
}

.pricing-table{
    width:100%;
    border-collapse:collapse;
}

.pricing-row td{
    padding-top:12px;
    padding-bottom:12px;
    border-bottom:1px solid #e6e6e6;
}

.price-label{
    font-size:15px;
    color:#777777;
}

.price-value{
    font-size:16px;
    color:#222222;
    font-weight:bold;
    text-align:right;
}

.total-label{
    font-size:16px;
    color:#555555;
    font-weight:bold;
}

.tax-label{
    font-size:11px;
    color:#9b9b9b;
    letter-spacing:1px;
    padding-top:2px;
}

.total-price{
    font-size:42px;
    font-weight:bold;
    color:#066168;
    text-align:right;
}

.note-text{
    text-align:center;
    font-size:12px;
    line-height:22px;
    color:#999999;
    padding-top:35px;
    padding-bottom:30px;
}

.review-btn{
    background:#066168;
    color:#ffffff;
    font-size:16px;
    font-weight:bold;
    text-align:center;
    padding-top:12px;
    padding-bottom:12px;
    width:240px;
}

.footer-ref{
    padding-top:520px;
    padding-right:35px;
    text-align:right;
    font-size:11px;
    color:#888888;
}
    .pricing-left{
    width:200px;
    vertical-align:top;

    background:#066168;

    background-image:
    linear-gradient(
        180deg,
        #066168 0%,
        #055158 35%,
        #07737c 70%,
        #04474d 100%
    );
}

.pricing-page{
    width:100%;
    height:1120px;
}

.pricing-main{
    height:980px;
}

.pricing-footer{
    height:140px;
}
// last page

.terms-page{
    width:100%;
    background:#ffffff;
}

.terms-header{
    background:#066168;
}

.terms-header td{
    padding-top:18px;
    padding-bottom:18px;
    padding-left:30px;
    padding-right:30px;
}

.terms-title{
    font-size:34px;
    font-weight:bold;
    color:#ffffff;
}

.terms-content{
    padding-top:30px;
    padding-left:35px;
    padding-right:35px;
    padding-bottom:20px;
}

.section-title{
    font-size:18px;
    font-weight:bold;
    color:#066168;
    padding-bottom:12px;
    padding-top:18px;
}

.term-text{
    font-size:12px;
    line-height:21px;
    color:#444444;
}

.term-list{
    padding-bottom:8px;
}

.term-bullet{
    width:18px;
    vertical-align:top;
    font-size:12px;
    color:#066168;
    padding-top:2px;
}

.term-content{
    vertical-align:top;
    font-size:12px;
    line-height:21px;
    color:#444444;
}

.footer-ref{
    padding-top:15px;
    font-size:11px;
    color:#888888;
}


.thankyou-page{
    width:100%;
    height:1120px;
    background:#066168;
}

.thankyou-wrapper{
    height:1120px;
}

.thankyou-content{
    padding-top:170px;
    padding-left:80px;
    padding-right:80px;
    text-align:center;
}

.small-title{
    font-size:18px;
    letter-spacing:5px;
    color:#d7f1ef;
    padding-bottom:28px;
}

.main-title{
    font-size:40px;
    line-height:60px;
    font-weight:bold;
    color:#ffffff;
    padding-bottom:35px;
}

.center-line{
    width:120px;
    height:3px;
    background:#d7f1ef;
}

.description{
    font-size:18px;
    line-height:34px;
    color:#eef8f7;
    padding-top:35px;
    padding-bottom:70px;
}

.contact-box{
    background:#ffffff;
    width:430px;
}

.contact-box td{
    padding-top:24px;
    padding-bottom:24px;
    padding-left:28px;
    padding-right:28px;
}

.contact-title{
    font-size:16px;
    font-weight:bold;
    color:#066168;
    padding-bottom:14px;
}

.contact-text{
    font-size:15px;
    line-height:28px;
    color:#444444;
}

.footer-ref{
    padding-right:35px;
    padding-bottom:25px;
    font-size:11px;
    color:#d7f1ef;
}









.day6-page{
    width:100%;
    border-collapse:collapse;
    page-break-inside:avoid;
}

.day6-content{
    padding:25px 35px;
}

.day6-description{
    font-size:14px;
    line-height:24px;
    color:#444;
}

.transfer-table{
    width:100%;
    border:1px solid #e5e5e5;
    border-radius:10px;
    padding:12px;
}

.meals-table{
    width:100%;
}

.meal-col{
    width:33.33%;
    vertical-align:top;
}


.transfer-page{
    width:100%;
    background:#ffffff;
}

.transfer-page-header{
    background:#066168;
}

.transfer-page-header td{
    padding-top:22px;
    padding-bottom:22px;
    padding-left:35px;
    padding-right:35px;
}

.transfer-page-title{
    font-size:36px;
    font-weight:bold;
    color:#ffffff;
}

.transfer-page-subtitle{
    font-size:14px;
    color:#d9f0ee;
    padding-top:6px;
}

.transfer-page-content{
    padding-top:30px;
    padding-left:35px;
    padding-right:35px;
    padding-bottom:20px;
}

.single-transfer-box{
    width:100%;
    border:1px solid #e4e4e4;
    border-radius:10px;
    padding:20px;
    background:#ffffff;
}

.transfer-icon-box{
    width:54px;
    height:54px;
    background:#e8f4f3;
    border-radius:50%;
}

.transfer-main-title{
    font-size:22px;
    font-weight:bold;
    color:#222222;
    padding-bottom:6px;
}

.transfer-subtitle{
    font-size:14px;
    line-height:24px;
    color:#666666;
    padding-bottom:14px;
}

.pickup-label{
    font-size:13px;
    font-weight:bold;
    color:#066168;
    padding-bottom:2px;
    padding-top:8px;
}

.pickup-value{
    font-size:14px;
    color:#444444;
    padding-bottom:4px;
}

.important-note {
    vertical-align: top;
    font-size: 12px;
    line-height: 21px;
    color: #444444;
}

.logo-box td{
    padding-top:8px;
    padding-bottom:8px;
    padding-left:16px;
    padding-right:16px;
}



.logo-box{
 
    padding:8px 16px;
    border-radius:18px;

    display:inline-block;
}

.cover-logo{
    width:300px;
    height:auto;
    display:block;
}



';

$extraMembers  = '';

if ($quotation['extra_adult'] > 0) {

    $extraMembers .= ', Extra Adult ' . $quotation['extra_adult'];
}


if ($quotation['child'] > 0) {

    $extraMembers .= ', Child With Bed ' . $quotation['child'];
}



/* =========================================================
HTML START
========================================================= */
$html = '

<!-- PAGE START -->
<div class="page">

    <div class="cover-bg">

        <div class="overlay">

            <div class="content-wrap">

            <!-- LOGO -->
<table cellpadding="0" cellspacing="0" border="0" align="center" class="logo-table">

    <tr>

        <td class="logo-box">

            <img src="' . $user_logo . '" class="cover-logo">

        </td>

    </tr>

</table>
     

                <!-- SPACE -->
                <div style="height:20px;"></div>

                <!-- TITLE -->
                <div class="main-title">
                    Trip to ' . $quotation['cities'] . '
                </div>

                <!-- REFERENCE -->
                <div class="ref-text">
                    Reference Number: ' . $quotation['quotation_id'] . '
                </div>

                <!-- LINE -->
                <div class="line"></div>

                <!-- INFO -->
                <table cellpadding="0" cellspacing="0" border="0" class="info-table">

                    <!-- LOCATION -->
                    <tr>

                        <td class="info-icon">

                            <img src="images/pdf/location.svg" width="21">

                        </td>

                        <td class="info-text">

                            ' . $quotation['cities'] . '

                        </td>

                    </tr>

                    <!-- DATE -->
                    <tr>

                        <td class="info-icon">

                            <img src="images/pdf/calendar.svg" width="21">

                        </td>

                        <td class="info-text">

                            ' . date("d M Y", strtotime($quotation['travel_date'])) . ' - ' . $quotation['nights'] . ' nights

                        </td>

                    </tr>

                    <!-- PAX -->
                    <tr>

                        <td class="info-icon">

                            <img src="images/pdf/user.svg" width="21">

                        </td>

                        <td class="info-text">

                            ' . $quotation['rooms'] . ' Rooms, ' . $quotation['pax'] . ' Adults' . $extraMembers . '

                        </td>

                    </tr>

                </table>

                <!-- FOOTER -->
                <div class="footer-text">

                    Specially prepared by

                    <span class="agency-name">
                        ' . $user_name . '
                    </span>

                </div>

            </div>

        </div>

    </div>

</div>

';

$html .= "<pagebreak/>";


$html .= '

<table cellpadding="0" cellspacing="0" border="0" class="second-page-table">

<tr>

    <!-- SIDEBAR -->
    <td class="sidebar-td">

        <img src="images/pdf/sidebar3.png" class="sidebar-img">

    </td>

    <!-- CONTENT -->
    <td class="content-td">

        <!-- TOP SECTION -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%">

            <!-- PREPARED FOR -->
            <tr>

                <td class="top-label">
                    Specially prepared for
                </td>

            </tr>

            <!-- GUEST -->
            <tr>

                <td class="guest-name">
                    ' . $quotation['guest_name'] . '
                </td>

            </tr>

            <!-- PREPARED BY -->
            <tr>

                <td class="prepared-title">
                    Specially prepared by
                </td>

            </tr>

            <!-- AGENT NAME -->
            <tr>

                <td class="agent-name">
                    ' . $user_name . '
                </td>

            </tr>

            <!-- ROLE -->
            <tr>

                <td class="company-name">
                    ' . $companyName . '
                </td>

            </tr>

        </table>

        <!-- CONTACT -->
        <table cellpadding="0" cellspacing="0" border="0" class="contact-table">

            <!-- PHONE -->
            <tr class="contact-row">

                <td width="40">

                    <img src="images/pdf/phone-colored.svg" width="25">

                </td>

                <td class="contact-text">
                    ' . $phone . '
                </td>

            </tr>

            <!-- EMAIL -->
            <tr class="contact-row">

                <td width="40">

                    <img src="images/pdf/email-colored.svg" width="25">

                </td>

                <td class="contact-text">
                    ' . $email . '
                </td>

            </tr>

        </table>

        <!-- NOTE -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" class="note-box">

            <tr>

                <td class="note-text">

                    This itinerary is a preliminary proposal. Please review it carefully and inform us of any changes or discrepancies.

                    <br>

                    Currently, no services are being held and all services and prices are subject to availability and potential currency fluctuations.

                    <br>

                    A deposit for a booking constitutes Customers acceptance of these Terms &amp; Conditions.

                    <br>

                    Please note that paying the deposit does not guarantee confirmation. Services remain On Request at the time of booking,
                    and if the original services are unavailable, alternatives may be offered with potential price adjustments.

                </td>

            </tr>

        </table>

    </td>

</tr>

</table>

';

$html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="itinerary-page">

<tr>

<td valign="top" class="itinerary-content">

    <!-- TITLE -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%">

        <tr>

            <td class="page-title">
                Itinerary
            </td>

        </tr>

    </table>

    <!-- TABLE -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="itinerary-table">

        <!-- HEAD -->
        <tr class="itinerary-head">

            <td width="140">
                Date
            </td>

            <td width="120">
                Product
            </td>

            <td>
                Description
            </td>

        </tr>

';


//$activityDate = strtotime($quotation['travel_date']);

usort($activities, function ($a, $b) {

    $dateA = strtotime($a['activity_date']);
    $dateB = strtotime($b['activity_date']);

    // Sort by date only
    if ($dateA == $dateB) {
        return 0; // maintain original order for same date
    }

    return ($dateA < $dateB) ? -1 : 1;
});



foreach ($activities as $index => $activity) {

    $currentDate =   $activity['activity_date'];

    $title =  $activity['title'];

    if (empty($title)) {
        $title = 'Leisure';
    }

    $tagClass = ($index % 2 == 0)
        ? 'activity-tag'
        : 'activity-tag-red';

    $html .= '

    <!-- ROW -->
    <tr class="itinerary-row">

        <td class="date-col">

            ' . $currentDate . '

        </td>

        <td class="product-col">

            Activity

        </td>

        <td class="desc-col">

            ' . $title . '

            <br>

          
        </td>

    </tr>

    ';
}

// tag can be added in activity when needed
//   <table cellpadding="0" cellspacing="0" border="0" class="'.$tagClass.'">

//                 <tr>

//                     <td>
//                         Included Activity
//                     </td>

//                 </tr>

//             </table>


$html .= '

    </table>

</td>

</tr>

</table>

';



// $html .= '<table cellpadding="0" cellspacing="0" border="0" width="100%" class="day-page">

//     <!-- TOP IMAGE -->
//     <tr>

//         <td>

//             <img src="images/pdf/day1.jpg" class="day-image">

//         </td>

//     </tr>

//     <!-- CONTENT -->
//     <tr>

//         <td valign="top" class="day-content">

//             <!-- TITLE -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="day-title">
//                         Arrival at Hanoi - Transfer to Hotel
//                     </td>

//                 </tr>

//                 <tr>

//                     <td class="day-subtitle">
//                         Day 1 - Wed, 10 Jun, 2026
//                     </td>

//                 </tr>

//             </table>

//             <!-- DESCRIPTION -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="day-description">

//                         On arrival at Noi Bai International Airport, our local representative will be waiting outside the customs area to welcome you and to take you to your hotel.

//                         <br>

//                         Rest of the day is free for you to explore Hanoi Town on your own.

//                     </td>

//                 </tr>

//             </table>

//             <!-- TRANSFER BOX -->
//             <table cellpadding="0" cellspacing="0" border="0" class="info-box">

//                 <tr>

//                     <td width="50">

//                         <img src="images/pdf/location.svg" width="28">

//                     </td>

//                     <td>

//                         <div class="info-title">
//                             One-way transfer from Hanoi Airport to Hotel - Private
//                         </div>

//                         <div class="info-text">
//                             Private Transfers • 9 Bags
//                         </div>

//                     </td>

//                 </tr>

//             </table>

//             <!-- MEALS -->
//             <table cellpadding="12" cellspacing="0" border="0" class="meal-table">

//                 <tr>

//                     <!-- LUNCH -->
//                     <td width="50%" class="meal-box">

//                         <table cellpadding="0" cellspacing="0" border="0">

//                             <tr>

//                                 <td width="40">

//                                     <img src="images/pdf/meal.svg" width="24">

//                                 </td>

//                                 <td>

//                                     <div class="meal-title">
//                                         Lunch
//                                     </div>

//                                     <div class="meal-status">
//                                         Not Included
//                                     </div>

//                                 </td>

//                             </tr>

//                         </table>

//                     </td>

//                     <!-- DINNER -->
//                     <td width="50%" class="meal-box">

//                         <table cellpadding="0" cellspacing="0" border="0">

//                             <tr>

//                                 <td width="40">

//                                     <img src="images/pdf/meal.svg" width="24">

//                                 </td>

//                                 <td>

//                                     <div class="meal-title">
//                                         Dinner
//                                     </div>

//                                     <div class="meal-status">
//                                         Not Included
//                                     </div>

//                                 </td>

//                             </tr>

//                         </table>

//                     </td>

//                 </tr>

//             </table>

//         </td>

//     </tr>

// </table>';





$html .= '<pagebreak/>';
// 6th page


/*
|--------------------------------------------------------------------------
| GET ACTIVITIES WITH ACTIVITY TABLE DATA
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT 
        qa.*,

        a.name,
        a.details,
        a.image,
        a.image2,
        a.city_id,
        qa.notes

    FROM quatation_activities qa

    LEFT JOIN activity a
        ON qa.activity_id = a.id

    WHERE qa.quotation_id = '" . $quotation['quotation_id'] . "'

    ORDER BY
        qa.activity_date ASC,
        qa.sort_order ASC,
        qa.id ASC
";

$result = mysqli_query($conn, $sql);

$activities = [];

while ($row = mysqli_fetch_assoc($result)) {

    $activities[] = $row;
}



/*
|--------------------------------------------------------------------------
| TRAVEL START DATE
|--------------------------------------------------------------------------
*/

$travelStart = new DateTime(
    $quotation['travel_date']
);



/*
|--------------------------------------------------------------------------
| LOOP ACTIVITIES
|--------------------------------------------------------------------------
*/

foreach ($activities as $index => $activity) {

    /*
    |--------------------------------------------------------------------------
    | ACTIVITY DATE
    |--------------------------------------------------------------------------
    */

    if (!empty($activity['activity_date'])) {

        $activityDate = new DateTime(
            $activity['activity_date']
        );
    } else {

        $activityDate = clone $travelStart;
    }


    /*
    |--------------------------------------------------------------------------
    | DAY NUMBER
    |--------------------------------------------------------------------------
    */

    $diff = $travelStart->diff(
        $activityDate
    );

    $dayNumber = $diff->days + 1;


    /*
    |--------------------------------------------------------------------------
    | FORMATTED DATE
    |--------------------------------------------------------------------------
    */

    $formattedDate = $activityDate->format(
        "D, d M, Y"
    );


    /*
    |--------------------------------------------------------------------------
    | TAG COLOR
    |--------------------------------------------------------------------------
    */

    $tagClass = ($index % 2 == 0)
        ? 'activity-tag'
        : 'activity-tag-red';


    /*
    |--------------------------------------------------------------------------
    | ICON
    |--------------------------------------------------------------------------
    */

    $icon = ($index % 2 == 0)
        ? 'calendar-colored.svg'
        : 'calendar.svg';


    /*
    |--------------------------------------------------------------------------
    | ACTIVITY TYPE
    |--------------------------------------------------------------------------
    */

    $activityType = 'Included Activity';

    if (
        !empty($activity['name']) &&
        stripos($activity['name'], 'arrival') !== false
    ) {

        $activityType = 'Arrival Transfer';
    } elseif (
        !empty($activity['name']) &&
        stripos($activity['name'], 'departure') !== false
    ) {

        $activityType = 'Departure Transfer';
    }


    /*
    |--------------------------------------------------------------------------
    | TIME
    |--------------------------------------------------------------------------
    */

    $activityTime = !empty($activity['time'])
        ? $activity['time']
        : 'Included in itinerary';


    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    $description = !empty($activity['details'])
        ? ($activity['details'])
        : '';


    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

    $notes = !empty($activity['notes'])
        ? ($activity['details'])
        : '';


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    $activityImage = 'images/default-activity.jpg';

    if (
        !empty($activity['image']) &&
        file_exists('uploads/activity image/' . $activity['image'])
    ) {

        $activityImage =
            'uploads/activity image/' . $activity['image'];
    }


    if (
        strtolower(trim($activity['name'] ?? '')) ==
        strtolower(ACTIVITY_ARRIVAL)
    ) {

        $activityImage = "images/arrival.png";
    }

    /* =====================================
DEPARTURE IMAGE
===================================== */ elseif (
        strtolower(trim($activity['name'] ?? '')) ==
        strtolower(ACTIVITY_DEPARTURE)
    ) {

        $activityImage = "images/departure.png";
    }


    if (empty($activity['name'])) {
        $activityImage = "images/leisure.png";
    }

    /*
    |--------------------------------------------------------------------------
    | HTML
    |--------------------------------------------------------------------------
    */

    if (ACTIVITY_ARRIVAL ==  $activity['name'] || ACTIVITY_DEPARTURE ==  $activity['name']) {
        $activity['name'] = '';
    }

    $html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="day6-page">

    <!-- HEADER -->
    <tr>

        <td class="day6-header">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="day6-header-text">
                        Day ' . $dayNumber . ' - ' . $formattedDate . '
                    </td>

                </tr>

            </table>

        </td>

    </tr>

    <!-- IMAGE -->
    <tr>

        <td>

           <img src="' . $activityImage . '" style="width:100%; object-fit:cover;">

        </td>

    </tr>

    <!-- CONTENT -->
    <tr>

        <td class="day6-content">

            <!-- TITLE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="day6-title">
                        ' . $activity['name'] . '
                    </td>

                </tr>

            </table>

';


    if ($description != '') {

        $html .= '

            <!-- DESCRIPTION -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="day6-description">

                        ' . $description . '

                    </td>

                </tr>

            </table>

';
    }


    if ($notes != '') {

        $html .= '

            <!-- NOTES -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="day6-description">

                        ' . $notes . '

                    </td>

                </tr>

            </table>

';
    }


    // $html .= '

    //             <!-- SPACE -->
    //             <table cellpadding="0" cellspacing="0" border="0" width="100%">

    //                 <tr>

    //                     <td class="space-20"></td>

    //                 </tr>

    //             </table>

    //             <!-- ACTIVITY -->
    //             <table cellpadding="0" cellspacing="0" border="0" width="100%" class="transfer-table">

    //                 <tr>

    //                     <td class="transfer-icon">

    //                         <img src="images/pdf/'.$icon.'" width="24">

    //                     </td>

    //                     <td class="transfer-content">

    //                         <div class="transfer-title">
    //                             '.$activity['name'].'
    //                         </div>

    //                         <div class="transfer-time">
    //                             '.$activityTime.'
    //                         </div>

    //                         <div style="height:8px;"></div>

    //                         <table cellpadding="0" cellspacing="0" border="0" class="'.$tagClass.'">

    //                             <tr>

    //                                 <td>
    //                                     '.$activityType.'
    //                                 </td>

    //                             </tr>

    //                         </table>

    //                     </td>

    //                 </tr>

    //             </table>

    // ';


    /*
|--------------------------------------------------------------------------
| HOTEL SECTION
|--------------------------------------------------------------------------
*/

    if (isset($hotels[$index])) {

        $hotel = $hotels[$index];

        $hotelName = isset($hotel['name'])
            ? $hotel['name']
            : '';

        $hotelLocation = isset($hotel['location'])
            ? $hotel['location']
            : '';

        $hotelNights = isset($hotel['nights'])
            ? $hotel['nights']
            : '';

        $html .= '

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td style="height:25px;"></td>

                </tr>

            </table>

            <!-- HOTEL -->
            <!-- <table cellpadding="0" cellspacing="0" border="0" width="100%" class="transfer-table">

                <tr>

                    <td class="transfer-icon">

                        <img src="images/pdf/bed.svg" width="22">

                    </td>

                    <td class="transfer-content">

                        <div class="transfer-title">
                            Overnight stay at ' . $hotelName . '
                        </div>

                        <div class="transfer-time">
                            ' . $hotelLocation . ' · ' . $hotelNights . ' nights
                        </div>

                        <div style="height:8px;"></div>

                        <table cellpadding="0" cellspacing="0" border="0" class="activity-tag">

                            <tr>

                                <td>
                                    Hotel Stay
                                </td>

                            </tr>

                        </table>

                    </td>

                </tr>

            </table>

             -->

    ';
    }


    $html .= '

        
        </td>

    </tr>

</table>

';


    /*
    |--------------------------------------------------------------------------
    | PAGE BREAK
    |--------------------------------------------------------------------------
    */

    if ($index != (count($activities) - 1)) {

        $html .= "<pagebreak/>";
    }
}

$html .= "<pagebreak/>";
foreach ($hotels as $index => $hotel) {

    $checkInDate = strtotime($quotation['travel_date'] . " +" . $index . " day");

    $checkOutDate = strtotime("+" . $hotel['nights'] . " day", $checkInDate);

    $html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="hotel-page">

    <!-- HEADER -->
    <tr>

        <td class="hotel-header">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td width="70%">

                        <div class="hotel-location">
                            ' . $hotel['location'] . '
                        </div>

                        <div class="hotel-duration">
                            ' . $hotel['nights'] . ' nights 
                        </div>

                    </td>

                </tr>

            </table>

        </td>

    </tr>

    <!-- CONTENT -->
    <tr>

        <td class="hotel-content">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <!-- LEFT IMAGES -->
                    <td class="hotel-image-col">

                        <img src="' . $hotel['image'] . '" class="hotel-image">

                       

                    </td>

                    <!-- RIGHT CONTENT -->
                    <td class="hotel-info-col">

                        <!-- HOTEL TITLE -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <!-- STARS -->
                            <tr>

                                <td class="hotel-stars">';


    $rating = isset($hotel['rating'])
        ? (float)$hotel['rating']
        : 0;

    $fullStars = floor($rating);

    $halfStar = ($rating - $fullStars) >= 0.5 ? 1 : 0;

    $emptyStars = 5 - $fullStars - $halfStar;


    /*
|--------------------------------------------------------------------------
| FULL STARS
|--------------------------------------------------------------------------
*/

    for ($i = 1; $i <= $fullStars; $i++) {

        $html .= '<img src="images/pdf/star.svg" width="14">';
    }


    /*
|--------------------------------------------------------------------------
| HALF STAR
|--------------------------------------------------------------------------
*/

    if ($halfStar) {

        $html .= '<img src="images/pdf/star-half.svg" width="14">';
    }


    /*
|--------------------------------------------------------------------------
| EMPTY STARS
|--------------------------------------------------------------------------
*/

    for ($i = 1; $i <= $emptyStars; $i++) {

        $html .= '<img src="images/pdf/star-empty.svg" width="14">';
    }





    $html .= '</td>

                            </tr>

                            <!-- TITLE -->
                            <tr>

                                <td class="hotel-title">
                                    ' . $hotel['name'] . '
                                </td>

                            </tr>

                            <!-- address -->
                            <tr>

                                <td class="hotel-address">
                                    ' . $hotel['location'] . '
                                </td>

                            </tr>

                        </table>

                        <!-- DATE SECTION -->
                        <table cellpadding="0" cellspacing="0" border="0" class="hotel-date-table">

                            <tr>

                                <!-- CHECK IN -->
                             <!--   <td width="35%">

                                    <div class="hotel-date-title">
                                        .date("l", $checkInDate).
                                    </div>

                                    <div class="hotel-date-value">
                                        02:00 PM, .date("M d, Y", $checkInDate).
                                    </div>

                                </td>
-->
                                <!-- NIGHTS -->
                                <td width="30%">

                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="hotel-night-box">


                                    <tr>

                                            <td>

                                                <div class="hotel-night-number">
                                                    ' . $hotel['nights'] . '
                                                </div>

                                                <div class="hotel-night-text">
                                                    nights
                                                </div>

                                            </td>

                                              <td>

                                                <div class="hotel-night-number">
                                                    ' . $hotel['rooms'] . '
                                                </div>

                                                <div class="hotel-night-text">
                                                    Room
                                                </div>

                                            </td>

                                              <td>

                                               

                                                <div class="hotel-night-text">
                                                    Meal Plan
                                                </div>


                                                 <div class="hotel-night-number">
                                                    ' . $hotel['meal'] . '
                                                </div>

                                            </td>
                                        </tr>
                                      
                                    </table>

                                </td>

                              

                            </tr>

                        </table>

                        <!-- DESCRIPTION -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="hotel-description">

                                    Experience a comfortable and relaxing stay at ' . $hotel['name'] . ' located in ' . $hotel['location'] . '.

                                    <br>

                                    Enjoy premium hospitality, spacious accommodations and convenient access to nearby attractions during your journey.

                                    <br>

                                    Your stay includes carefully selected room options and meal plans for a pleasant travel experience.

                                </td>

                            </tr>

                        </table>

                       

                        <!-- FOOTER -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td align="right" class="hotel-footer">

                                    ' . date("D, M d, Y") . ' Ref: ' . $quotation['quotation_id'] . '

                                </td>

                            </tr>

                        </table>

                    </td>

                </tr>

            </table>

        </td>

    </tr>

</table>

';


    if ($index != (count($hotels) - 1)) {
        $html .= "<pagebreak/>";
    }
}




if (!empty($pickDropDetails)) {
  
    $html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="transfer-page">

    <!-- HEADER -->
    <tr>

        <td class="transfer-page-header">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="transfer-page-title">
                        Pickup and Drop
                    </td>

                </tr>

              

            </table>

        </td>

    </tr>

    <!-- CONTENT -->
    <tr>

        <td valign="top" class="transfer-page-content">

';


   
        $html .= '

            <!-- TRANSFER BOX -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="single-transfer-box">

                <tr>

                    <!-- ICON -->
                    <td width="70" valign="top">

                        <table cellpadding="0" cellspacing="0" border="0" class="transfer-icon-box">

                            <tr>

                                <td align="center">

                                    <img src="images/pdf/car.svg" width="28">

                                </td>

                            </tr>

                        </table>

                    </td>

                    <!-- CONTENT -->
                    <td valign="top">

                        <!-- VEHICLE -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="transfer-main-title">

                                    ' . $pickDropDetails['vehicle_name'] . '

                                </td>

                            </tr>

                        </table>

                       

                        <!-- PICKUP -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="display:flex;">

                            <tr>

                                <td class="pickup-label">
                                    Pickup From :
                                </td>

                            </tr>

                            <tr>

                                <td class="pickup-value">
                                    ' . $pickDropDetails['pickup'] . '
                                </td>

                            </tr>

                        </table>

                        <!-- DROP -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="pickup-label">
                                    Drop to :
                                </td>

                            </tr>

                            <tr>

                                <td class="pickup-value">
                                    ' . $pickDropDetails['drop'] . '
                                </td>

                            </tr>

                        </table>

                      

                    </td>

                </tr>

            </table>

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td style="height:18px;"></td>

                </tr>

            </table>  

    ';

    $html .= '

        </td>

    </tr>

</table>

';
    }





















if (!empty($transfers)) {
    $html .= '<pagebreak/>';

    $html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="transfer-page">

    <!-- HEADER -->
    <tr>

        <td class="transfer-page-header">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="transfer-page-title">
                        Transfers
                    </td>

                </tr>

                <tr>

                    <td class="transfer-page-subtitle">
                        Airport, railway station and intercity transfer details
                    </td>

                </tr>

            </table>

        </td>

    </tr>

    <!-- CONTENT -->
    <tr>

        <td valign="top" class="transfer-page-content">

';


    foreach ($transfers as $index => $transfer) {

        $vehicle = !empty($transfer['vehicle'])
            ? $transfer['vehicle']
            : '';

        $transferName = !empty($transfer['transfer'])
            ? $transfer['transfer']
            : '';

        $pickup = !empty($transfer['pickup'])
            ? $transfer['pickup']
            : '-';

        $drop = !empty($transfer['drop'])
            ? $transfer['drop']
            : '-';

        $seater = !empty($transfer['seater'])
            ? ' - ' . $transfer['seater']
            : '';



        $tagClass = ($index % 2 == 0)
            ? 'activity-tag'
            : 'activity-tag-blue';



        $html .= '

            <!-- TRANSFER BOX -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="single-transfer-box">

                <tr>

                    <!-- ICON -->
                    <td width="70" valign="top">

                        <table cellpadding="0" cellspacing="0" border="0" class="transfer-icon-box">

                            <tr>

                                <td align="center">

                                    <img src="images/pdf/car.svg" width="28">

                                </td>

                            </tr>

                        </table>

                    </td>

                    <!-- CONTENT -->
                    <td valign="top">

                        <!-- VEHICLE -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="transfer-main-title">

                                    ' . $vehicle . $seater . '

                                </td>

                            </tr>

                        </table>

                        <!-- TRANSFER NAME -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="transfer-subtitle">

                                    ' . $transferName . '

                                </td>

                            </tr>

                        </table>

                        <!-- PICKUP -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="display:flex;">

                            <tr>

                                <td class="pickup-label">
                                    Pickup From :
                                </td>

                            </tr>

                            <tr>

                                <td class="pickup-value">
                                    ' . $pickup . '
                                </td>

                            </tr>

                        </table>

                        <!-- DROP -->
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">

                            <tr>

                                <td class="pickup-label">
                                    Drop to :
                                </td>

                            </tr>

                            <tr>

                                <td class="pickup-value">
                                    ' . $drop . '
                                </td>

                            </tr>

                        </table>

                        <!-- TAG -->
                        <table cellpadding="0" cellspacing="0" border="0" class="' . $tagClass . '">

                            <tr>

                                <td>
                                    Private Transfer
                                </td>

                            </tr>

                        </table>

                    </td>

                </tr>

            </table>

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td style="height:18px;"></td>

                </tr>

            </table>

    ';
    }



    $html .= '

        </td>

    </tr>

</table>

';
}


// 12th page

// $html .= '
// <table cellpadding="0" cellspacing="0" border="0" width="100%" class="day-page">

//     <!-- HEADER -->
//     <tr>

//         <td class="day-header">

//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="day-header-text">
//                         Day 6 - Mon, 15 Jun, 2026
//                     </td>

//                 </tr>

//             </table>

//         </td>

//     </tr>

//     <!-- CONTENT -->
//     <tr>

//         <td valign="top" class="day-content">

//             <!-- TITLE -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="day-title">
//                         Kiss of Sea Show with Kiss Bridge and Sunset Town
//                     </td>

//                 </tr>

//             </table>

//             <!-- DESCRIPTION -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="day-description">

//                         Experience a magical sunset at Kiss Bridge before enjoying the spectacular Kiss of the Sea show. A perfect evening of lights, music, and breathtaking coastal views in Sunset Town.

//                     </td>

//                 </tr>

//             </table>

//             <!-- ACTIVITY -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%" class="activity-table">

//                 <tr>

//                     <td class="activity-icon">

//                         <img src="images/pdf/calendar.svg" width="16">

//                     </td>

//                     <td class="activity-content">

//                         <div class="activity-title">
//                             Kiss of Sea Show with Kiss Bridge and Sunset Town - Private Tour
//                         </div>

//                         <div style="padding-top:6px;">

//                             <table cellpadding="0" cellspacing="0" border="0" class="activity-tag">

//                                 <tr>

//                                     <td>
//                                         Private Transfers
//                                     </td>

//                                 </tr>

//                             </table>

//                         </div>

//                     </td>

//                 </tr>

//             </table>

//             <!-- SPACE -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>
//                     <td class="space-row"></td>
//                 </tr>

//             </table>

//             <!-- HOTEL -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td width="26">

//                         <img src="images/pdf/bed.svg" width="16">

//                     </td>

//                     <td class="hotel-text">

//                         Overnight stay at AVS Hotel Phu Quoc

//                     </td>

//                 </tr>

//             </table>

//             <!-- MEALS -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%" class="meal-section">

//                 <tr>

//                     <!-- BREAKFAST -->
//                     <td class="meal-col">

//                         <table cellpadding="0" cellspacing="0" border="0">

//                             <tr>

//                                 <td width="22">

//                                     <img src="images/pdf/meal.svg" width="14">

//                                 </td>

//                                 <td>

//                                     <div class="meal-title">
//                                         Breakfast
//                                     </div>

//                                     <div style="color:#4da86f; font-size:13px;">
//                                         Included at Hotel
//                                     </div>

//                                 </td>

//                             </tr>

//                         </table>

//                     </td>

//                     <!-- LUNCH -->
//                     <td class="meal-col">

//                         <table cellpadding="0" cellspacing="0" border="0">

//                             <tr>

//                                 <td width="22">

//                                     <img src="images/pdf/meal.svg" width="14">

//                                 </td>

//                                 <td>

//                                     <div class="meal-title">
//                                         Lunch
//                                     </div>

//                                     <div class="meal-text">
//                                         Not Included
//                                     </div>

//                                 </td>

//                             </tr>

//                         </table>

//                     </td>

//                     <!-- DINNER -->
//                     <td class="meal-col">

//                         <table cellpadding="0" cellspacing="0" border="0">

//                             <tr>

//                                 <td width="22">

//                                     <img src="images/pdf/meal.svg" width="14">

//                                 </td>

//                                 <td>

//                                     <div class="meal-title">
//                                         Dinner
//                                     </div>

//                                     <div class="meal-text">
//                                         Not Included
//                                     </div>

//                                 </td>

//                             </tr>

//                         </table>

//                     </td>

//                 </tr>

//             </table>

//             <!-- FOOTER SPACE -->
//             <table cellpadding="0" cellspacing="0" border="0" width="100%">

//                 <tr>

//                     <td class="footer-space"></td>

//                 </tr>

//             </table>

//         </td>

//     </tr>

// </table>
// ';




$html .= "<pagebreak/>";


$html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="pricing-page">

<tr>

    <!-- LEFT SIDEBAR -->
    <td class="pricing-left" valign="top">
        &nbsp;
    </td>

    <!-- RIGHT CONTENT -->
    <td class="pricing-right" valign="top">

        <!-- FULL HEIGHT WRAPPER -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" height="1120">

            <!-- MAIN CONTENT -->
            <tr>

                <td valign="top" class="pricing-content">

                    <!-- TITLE -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">

                        <tr>

                            <td class="pricing-title">
                                Pricing Summary
                            </td>

                        </tr>

                    </table>

                    <!-- TRIP INFO -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="pricing-table">

                       


<tr class="pricing-row">

    <td class="price-label">
        Adults: <strong>' . $quotation['pax'] . '</strong>
    </td>

    <td></td>

</tr>






<tr class="pricing-row">

    <td class="price-label">
        Extra Adult Price  ('.$extraAdult.'): <strong>₹ ' . number_format( $extraAdultTotalPriceWithMarkup ) . '</strong>
    </td>

    <td></td>

</tr>




<tr class="pricing-row">

    <td class="price-label">
        Child Bed Price ('.$childBed.'): <strong>₹ ' . number_format(  $ChildBedTotalPriceWithMarkup) . '</strong>
    </td>

    <td></td>

</tr>

<tr class="pricing-row">

    <td class="price-label">
        Package Cost Per Person: <strong>₹ ' . number_format($pricePerPerson) . '</strong>
    </td>

    <td></td>

</tr>

<tr class="pricing-row">

    <td class="price-label">
        Total Package Cost: <strong>₹ ' . number_format($quotation['total_price']) . '</strong>
    </td>

    <td></td>

</tr>



                    </table>

                    <!-- NOTE -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">

                        <tr>

                            <td align="center" class="note-text">

                                Total price as calculated on ' . date("d M Y") . '

                                <br>

                                Price subject to availability

                            </td>

                        </tr>

                    </table>

                    <!-- BUTTON -->
                    <table cellpadding="0" cellspacing="0" border="0" align="center">

                        <tr>

                            <td class="review-btn">
                                Review &amp; book your trip
                            </td>

                        </tr>

                    </table>

                </td>

            </tr>

            <!-- FOOTER -->
            <tr>

                <td valign="bottom" align="right" class="footer-ref">

                    ' . date("D, M d, Y") . ' Ref: ' . $quotation['quotation_id'] . '

                </td>

            </tr>

        </table>

    </td>

</tr>

</table>

';


$html .= "<pagebreak/>";
$html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="terms-page">

    <!-- HEADER -->
    <tr>

        <td class="terms-header">

            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="terms-title">
                        Terms and Conditions
                    </td>

                </tr>

            </table>

        </td>

    </tr>

    <!-- CONTENT -->
    <tr>

        <td valign="top" class="terms-content">

            <!-- POLICY -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="section-title">
                        Policy &amp; Important Terms
                    </td>

                </tr>

            </table>

            <!-- TERMS -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="term-list">

                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        To ensure complete transparency, we have laid down a standard universal cancellation policy and terms applicable for all bookings made with us. Sometimes due to unforeseen circumstances, you may need to cancel or reschedule your booking. While we would want to extend all due consideration to your circumstances, airline, hotel and supplier constraints force us to collect cancellation fees as per the below policy.

                    </td>

                </tr>

                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        Please note that the hotel is solely responsible for providing all hotel services, including accommodations, amenities, and customer service. The travel agent acts solely as an intermediary and does not assume liability or responsibility for hotel services offered.

                        <br>

                        Token amount is non-refundable as all bookings are processed using this amount only. Guests are strongly advised to verify hotel facilities, location, room types and related information before booking.

                    </td>

                </tr>

                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        Airlines hold full responsibility for any flight changes, rescheduling, delays or cancellations. The travel agent acts only as an intermediary and shall not be held liable for modifications made by airlines.

                    </td>

                </tr>

                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        Certain hotels may require deposits or collect taxes at check-in. These are hotel policies and customers are required to pay applicable charges directly to the hotel upon arrival.

                    </td>

                </tr>



                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                       Rates are not valid during blackout dates, long weekends, festive periods, or public holidays.

                    </td>

                </tr>

                <!-- ITEM -->
                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                      The token amount shall remain strictly non-refundable under any circumstances. However, any consideration for adjustment or partial refund shall be solely subject to availability and management discretion.

                    </td>

                </tr>

            </table>

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>
                    <td style="height:18px;"></td>
                </tr>

            </table>

            <!-- PAYMENT POLICY -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="section-title">
                        Payment Policy
                    </td>

                </tr>

            </table>

            <!-- PAYMENT CONTENT -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="term-list">

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        50% amount of package advance.

                    </td>

                </tr>

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        Rest amount on completion of bookings.

                    </td>

                </tr>

            </table>

            <!-- IMPORTANT -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="important-note">

                        Important: The booking stands liable to be canceled if 100% payment is not received before 19 days from the date of departure.

                        <br>

                        Booking policy is subject to change depending upon the travel period and destinations opted for.

                        <br>

                        100% payment may be required in advance for specific destinations or high-end hotels.

                    </td>

                </tr>

            </table>

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>
                    <td style="height:20px;"></td>
                </tr>

            </table>

            <!-- CANCELLATION -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="section-title">
                        Cancellation Policy
                    </td>

                </tr>

            </table>

            <!-- CANCELLATION CONTENT -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="term-list">

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        30 days or before prior to the starting of the tour – 15% of Package Cost

                    </td>

                </tr>

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        30 – 15 days prior to the starting of the tour – 25% of Package Cost

                    </td>

                </tr>

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        15 – 07 days prior to the starting of the tour – 50% of Package Cost

                    </td>

                </tr>

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        In case of No Show – 100% of Package Cost

                    </td>

                </tr>

                <tr>

                    <td class="term-bullet">
                        •
                    </td>

                    <td class="term-content">

                        Government charges will not be refundable.

                    </td>

                </tr>

            </table>

            <!-- SPACE -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>
                    <td style="height:20px;"></td>
                </tr>

            </table>

            <!-- REFUND -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="section-title">
                        Refund &amp; Cancellation Notes
                    </td>

                </tr>

            </table>

            <!-- REFUND CONTENT -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>

                    <td class="important-note" style="color:;">

                        Online Transaction Charges (2.5%) will not be refunded.

                        <br>

                        Refund for hotel payments will follow hotel cancellation policies.

                        <br>

                        Train ticket cancellations will follow Railway policies.

                        <br>

                        Flight ticket cancellations will follow airline company policies.

                        <br>

                        In case you cancel the trip after commencement, refunds would depend on the amount recoverable from hoteliers and contractors.

                        <br>

                        For unused hotel accommodation, chartered transportation and missed meals, we do not bear responsibility to refund.

                    </td>

                </tr>

            </table>

           

        </td>

    </tr>

</table>

';
$html .= '

<table cellpadding="0" cellspacing="0" border="0" width="100%" class="thankyou-page">

<tr>

<td valign="top">

    <!-- FULL HEIGHT -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" class="thankyou-wrapper">

        <!-- MAIN CONTENT -->
        <tr>

            <td valign="top" align="center" class="thankyou-content">

                <!-- SMALL -->
                <table cellpadding="0" cellspacing="0" border="0" align="center">

                    <tr>

                        <td class="small-title">
                            THANK YOU
                        </td>

                    </tr>

                </table>

                <!-- TITLE -->
                <table cellpadding="0" cellspacing="0" border="0" align="center">

                    <tr>

                        <td class="main-title">
                            Have a Wonderful Trip
                        </td>

                    </tr>

                </table>

                <!-- LINE -->
                <table cellpadding="0" cellspacing="0" border="0" align="center">

                    <tr>

                        <td class="center-line"></td>

                    </tr>

                </table>

                <!-- DESCRIPTION -->
                <table cellpadding="0" cellspacing="0" border="0" width="72%" align="center">

                    <tr>

                        <td class="description">

                            Thank you for choosing ' . $companyName . '.

                            <br>

                            We hope your journey to ' . $quotation['cities'] . ' creates unforgettable memories for you and your family.

                            <br>

                            Wishing you safe travels and an amazing holiday experience throughout your ' . $quotation['nights'] . ' nights stay.

                        </td>

                    </tr>

                </table>

                <!-- CONTACT BOX -->
                <table cellpadding="0" cellspacing="0" border="0" align="center" class="contact-box">

                    <tr>

                        <td align="center">

                            <div class="contact-title">
                                Need Assistance?
                            </div>

                            <div class="contact-text">

                                ' . $companyName . '

                                <br>

                                ' . $phone . '

                                <br>

                                ' . $email . '

                            </div>

                        </td>

                    </tr>

                </table>

            </td>

        </tr>

        <!-- FOOTER -->
        <tr>

            <td valign="bottom" align="right" class="footer-ref">

                ' . date("D, M d, Y") . ' Ref: ' . $quotation['quotation_id'] . '

            </td>

        </tr>

    </table>

</td>

</tr>

</table>

';
/* =========================================================
RENDER PDF
========================================================= */


// <img
// src="images/curiosity.png"
// style="
// position:fixed;
// top:250px;
// left:180px;
// width:420px;
// opacity:0.05;
// z-index:-1;
// ">

// $mpdf->SetWatermarkImage(
//     'images/curiosity.png',
//     0.1,
//     '',
//     [60, 60]
// );

// $mpdf->showWatermarkImage = true;
//$mpdf->watermarkImgBehind = true;
$mpdf->WriteHTML($stylesheet, \Mpdf\HTMLParserMode::HEADER_CSS);

$mpdf->WriteHTML($html, \Mpdf\HTMLParserMode::HTML_BODY);

//$mpdf->Output('quotation.pdf', 'I');

$mpdf->Output(
    'quotation' . $user_id . '.pdf',
    \Mpdf\Output\Destination::DOWNLOAD
);

?>


<style>
    <?php
    //echo $stylesheet;

    ?>
</style>

<?php


































































































































































































































booking.php

<?php
include 'db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (
    empty($_SESSION['state'])
) {

    header("Location: state.php");
    exit;
}

if (!isset($_SESSION['logged_in'])) {

    // STORE CURRENT PAGE
    $_SESSION['redirect_after_login'] =
        $_SERVER['REQUEST_URI'];

    $_SESSION['notify'] = [
        'type' => 'error',
        'msg'  => 'Please login before generating a quotation.'
    ];

    header('Location: login.php');

    exit;
}
// Main file: index.php or quatation.php



// // Get user and state ID from session
// $id = $_SESSION['id'];
// $sql = "SELECT * FROM user_state WHERE user_id = '$id'";
// $result = $conn->query($sql);
// $state_id = null;
// while ($row = mysqli_fetch_assoc($result)) {
//     $state_id = $row['state_id'];
// }


$sliderQuery = mysqli_query($conn, "
    SELECT *
    FROM homepage_slider
    WHERE status = 1
    ORDER BY sort_order ASC, id DESC
");

$title = "Generate A Quotation";

if (!empty($customTitle)) {
    $title = $customTitle;
}


include 'header.php';
?>

<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>

<style>
    .remove-destination {
        margin-top: 35px;
    }
</style>
<link rel="stylesheet" href="theme/css/booking.css">








<div class="relative bg-cover bg-center w-full bg-white bg-[url(../images/background/inr-banner.jpg)] overflow-hidden">
    <div class="opacity-100 absolute left-0 top-0 size-full"></div>
    <div class="flex w-full lg:h-160 md:h-135 h-100 pb-10 items-baseline mx-auto">
        <div class="relative md:mt-60 mt-45 flex items-center justify-center w-full flex-col z-5">
            <div>
                <h2 class="lg:text-60 md:text-52 text-28 relative"><?= $title  ?></h2>
            </div>
            <!-- BREADCRUMB ROW -->
            <div>
                <ul class="inline-block">
                    <li class="text-base pr-7.5 relative inline-block font-semibold text-primary after:content-['-'] after:absolute after:right-2 after:-top-1.5 after:text-primary after:text-26 after:font-normal">
                        <a href="index.php">Home</a>
                    </li>
                    <li class="relative inline-block text-base font-semibold text-primary"><?= $title ?></li>
                </ul>
            </div>
        </div>
        <!-- BREADCRUMB ROW END -->
    </div>
    <div class="h-50 w-full absolute top-50 left-0 z-1">
        <div class="inline-block whitespace-nowrap animate-moveCloud">
            <img src="theme/images/inr-banner-cloud.png" alt="Image" class="h-47.5">
        </div>
    </div>
    <div class="absolute w-1/2 right-0 top-0 bottom-0 z-1">
        <div class="mt-60 animate-slide-right"><img src="theme/images/airplane.png" alt="Image" class="animate-slide-top-fast" width="378" height="146"></div>
    </div>
    <div class="absolute right-11.25 bottom-16.25 animate-slide-top2"><img src="theme/images/hotballon-Left.png" alt="Image" class="md:w-21 w-10" width="84" height="121"></div>
    <div class="absolute md:-right-15 -right-10 top-41.25 animate-slide-top"><img src="theme/images/hotballon-right.png" alt="Image" class="md:w-37.5 w-20"
            width="230" height="333"></div>
</div>

<div class="xl:py-30 py-12.5 px-5">
    <div class="max-w-437.5 mx-auto bg-white rounded-6xl xl:p-15 p-5 shadow-[0px_4px_80px_rgba(6,97,104,0.28)] relative">
        <div class="grid grid-cols-12 lg:gap-7.5">
            <div class="2xl:col-span-12 lg:col-span-12 col-span-12">
                <div class="form">

                    <form class="mt-5 space-y-8" method="post" id="myForm">
                        <div class="">



                            <!--       <div class="header premium-header">-->

                            <!--    <div class="header-content">-->



                            <!--        <div class="header-left">-->

                            <!--            <div class="header-icon">-->

                            <!--                <i class="fa-solid fa-plane-departure"></i>-->

                            <!--            </div>-->

                            <!--            <div>-->

                            <!--                <h2>Create a Quotation</h2>-->

                            <!--                <p>-->
                            <!--                    Build premium travel quotations with hotels,-->
                            <!--                    transfers and activities-->
                            <!--                </p>-->

                            <!--            </div>-->

                            <!--        </div>-->



                            <!--        <div class="header-badge">-->

                            <!--            <i class="fa-solid fa-earth-asia"></i>-->

                            <!--            Travel CRM-->

                            <!--        </div>-->

                            <!--    </div>-->

                            <!--</div>-->



                            <!-- =========================
SECTION : GUEST DETAILS
========================= -->

                            <div class="premium-section flex items-center gap-4 mb-8">

                                <div class="premium-icon purple">
                                    <i class="fa-solid fa-user-group"></i>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-bold text-gray-800">Guest & Travel Details</h3>
                                    <p class="text-gray-500">Basic quotation and trip information</p>
                                </div>

                            </div>
                            <div class="bg-[#FFF8EB] xl:py-15 xl:px-12.5 sm:p-7.5 p-5 rounded-3xl max-lg:mx-auto max-lg:max-w-160 max-md:max-w-full">

                                <div class="mb-3">
                                    <label for="guestName" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-user"></i> Guest Name</label>
                                    <div class="animated-border-wrapper">
                                        <input type="text" id="guestName" name="guestName" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" placeholder="Enter guest name" value="<?php echo !empty($quotationDetailsToEdit) ? $quotationDetailsToEdit['guestName'] : ""; ?>">

                                    </div>
                                </div>

                                <div class="row g-4 mb-3">
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="travelDate" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-calendar-check"></i> Travel Start Date</label>
                                        <div class="animated-border-wrapper">
                                            <input type="date" id="travelDate" name="travelDate" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" value="<?php echo !empty($quotationDetailsToEdit) ? $quotationDetailsToEdit['travelDate'] : ""; ?>">
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="travelEndDate" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-calendar-xmark"></i> Travel End Date</label>
                                        <div class="animated-border-wrapper">
                                            <input type="date" id="travelEndDate" name="travelEndDate" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" value="<?php echo !empty($quotationDetailsToEdit) ? $quotationDetailsToEdit['travelEndDate'] : ""; ?>">
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="nights" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-moon"></i> Total Nights</label>
                                        <div class="animated-border-wrapper">
                                            <input type="text" id="nights" name="nights" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" placeholder="Enter number of nights" value="<?php echo !empty($quotationDetailsToEdit) ? $quotationDetailsToEdit['nights'] : ""; ?>">
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <input type="hidden" id="selectedMonth" name="month" value="<?php echo date('n'); ?>">
                            <script>
                                document.getElementById("travelDate").addEventListener("change", function() {
                                    let selectedDate = new Date(this.value);
                                    let selectedMonth = selectedDate.getMonth() + 1; // Get month (1-based)

                                    // Send AJAX request
                                    let xhr = new XMLHttpRequest();
                                    xhr.open("GET", "fetch_hotels.php?month=" + selectedMonth, true);
                                    xhr.onload = function() {
                                        if (this.status == 200) {
                                            document.getElementById("hotel-list").innerHTML = this.responseText;
                                        }
                                    };
                                    xhr.send();
                                });
                            </script>



                            <!-- =========================
SECTION : DESTINATION
========================= -->

                            <div class="premium-section flex items-center gap-4 mb-8">

                                <div class="premium-icon blue">
                                    <i class="fa-solid fa-location-dot"></i>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-bold text-gray-800">Destinations</h3>
                                    <p class="text-gray-500">Select cities and distribute nights</p>
                                </div>

                            </div>

                            <div class="bg-[#FFF8EB] xl:py-15 xl:px-12.5 sm:p-7.5 p-5 rounded-3xl mt-8">

                                <div id="destinationContainer">




                                    <?php
                                    $cityCount = 0;
                                    if (!empty($quotation_id)) {
                                        $selectstate =  "SELECT * FROM quatation_cities WHERE quotation_id = '$quotation_id'";
                                        $resultstate = mysqli_query($conn, $selectstate);

                                        $selected_state_id = '';
                                        $selected_city_id = '';
                                        $nights = '';
                                        while ($row_quotation = mysqli_fetch_assoc($resultstate)) {
                                            $cityCount++; // ✅ count each city

                                            $selected_state_id = $row_quotation['state_id'];
                                            $selected_city_id = $row_quotation['city_id'];
                                            $nights = $row_quotation['nights'];

                                            // echo "Total Cities: " . $cityCount;


                                    ?>






                                            <div class="row destination-row ">
                                                <div class="w-full md:w-1/2 xl:w-[32%]">
                                                    <label for="city" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-location-dot"></i> City</label>
                                                    <div class="animated-border-wrapper">
                                                        <select class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]  city" name="city[]">


                                                            <?php

                                                            if (!empty($selected_state_id)) {

                                                                $cityQuery = "SELECT * FROM city WHERE state_id = '$selected_state_id'";
                                                                $cityResult = mysqli_query($conn, $cityQuery);


                                                                while ($city = mysqli_fetch_assoc($cityResult)) {
                                                                    $selected = ($city['id'] == $selected_city_id) ? "selected" : "";
                                                                    echo "<option value='" . $city['id'] . "' $selected>" . $city['city_name'] . "</option>";
                                                                }
                                                            }
                                                            ?>

                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="w-full md:w-1/3 xl:w-[32%]">
                                                    <label for="nights1" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-moon"></i> Nights in City</label>
                                                    <div class="animated-border-wrapper">
                                                        <input type="text" name="nights[]" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" placeholder="Number of nights" value="<?php echo (!empty($nights)) ? htmlspecialchars($nights) : ""; ?>">
                                                    </div>
                                                </div>
                                                <div class="col-md-2">
                                                    <button type="button" class="btn btn-danger rounded-xl min-h-[52px] w-full remove-destination"><i class="fas fa-trash-alt"></i></button>
                                                </div>
                                            </div>






                                        <?php }
                                    } else {

                                        ?>

                                        <div class="row destination-row ">
                                            <div class="w-full md:w-1/2 xl:w-[32%]">
                                                <label for="city" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-location-dot"></i> City</label>
                                                <div class="animated-border-wrapper">
                                                    <select class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]  city" name="city[]"></select>
                                                </div>
                                            </div>
                                            <div class="w-full md:w-1/3 xl:w-[32%]">
                                                <label for="nights1" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-moon"></i> Nights in City</label>
                                                <div class="animated-border-wrapper">
                                                    <input type="text" name="nights[]" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]" placeholder="Number of nights">
                                                </div>
                                            </div>
                                            <div class="col-md-2">
                                                <button type="button" class="btn btn-danger rounded-xl min-h-[52px] w-full remove-destination"><i class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>

                                        <script>
                                            $(document).ready(function() {
                                                // Load cities for the first city dropdown
                                                $.ajax({
                                                    url: "get_cities.php",
                                                    type: "GET",
                                                    success: function(data) {
                                                        $(".city").html(data);
                                                    }
                                                });
                                            });
                                        </script>

                                    <?php
                                    } ?>



                                </div>











                                <button type="button" class="btn btn-primary rounded-xl px-6 py-3 mt-3 mb-10" id="addDestination">+ Add Another City</button>



                                <script>
                                    const travelDate = document.getElementById("travelDate");
                                    const travelEndDate = document.getElementById("travelEndDate");
                                    const nightsInput = document.getElementById("nights");

                                    // Open native date picker on click
                                    travelDate.addEventListener("click", function() {
                                        this.showPicker();
                                    });

                                    travelEndDate.addEventListener("click", function() {
                                        this.showPicker();
                                    });

                                    // When start date changes
                                    travelDate.addEventListener("change", function() {
                                        const startDate = this.value;

                                        if (startDate) {
                                            // 🔥 Set minimum end date = selected start date
                                            travelEndDate.min = startDate;

                                            // If end date is already selected but invalid → reset
                                            if (travelEndDate.value && travelEndDate.value < startDate) {
                                                travelEndDate.value = "";
                                                nightsInput.value = "";
                                            }
                                        }

                                        calculateNights();
                                    });

                                    // When end date changes
                                    travelEndDate.addEventListener("change", calculateNights);

                                    function calculateNights() {
                                        const startDate = travelDate.value;
                                        const endDate = travelEndDate.value;

                                        if (startDate && endDate) {
                                            const start = new Date(startDate);
                                            const end = new Date(endDate);

                                            const diffTime = end - start;
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                            if (diffDays > 0) {
                                                nightsInput.value = diffDays;

                                                // Call your existing function
                                                if (typeof distributeNights === "function") {
                                                    distributeNights(diffDays);
                                                }
                                            } else {
                                                nightsInput.value = "";
                                                alert("End date must be after the start date.");
                                                travelEndDate.value = "";
                                            }
                                        }
                                    }


                                    // Function to distribute nights automatically
                                    function distributeNights(totalNights) {
                                        let cityInputs = document.querySelectorAll("input[name='nights[]']");
                                        let cityCount = cityInputs.length;

                                        if (cityCount > 0) {
                                            let baseNights = Math.floor(totalNights / cityCount);
                                            let remainingNights = totalNights % cityCount;

                                            cityInputs.forEach((input, index) => {
                                                input.value = baseNights + (index < remainingNights ? 1 : 0); // Distribute remaining nights
                                            });
                                        }
                                    }

                                    // Function to add a new destination dynamically with event bindings
                                    document.getElementById("addDestination").addEventListener("click", function() {
                                        var destinationContainer = document.getElementById("destinationContainer");
                                        var newDestination = destinationContainer.querySelector('.destination-row').cloneNode(true);

                                        // Clear input values
                                        newDestination.querySelector("input[name='nights[]']").value = "";
                                        newDestination.querySelector("select.city").selectedIndex = 0;

                                        // Add event listener for remove button for newly added row
                                        newDestination.querySelector(".remove-destination").addEventListener("click", function() {
                                            newDestination.remove();
                                            distributeNights(parseInt(document.getElementById("nights").value) || 0); // Recalculate after removal
                                        });

                                        destinationContainer.appendChild(newDestination);
                                        fetchHotels();
                                        distributeNights(parseInt(document.getElementById("nights").value) || 0); // Recalculate when adding a city

                                        // Reload cities options for the new city select
                                        $.ajax({
                                            url: "get_cities.php",
                                            type: "GET",
                                            success: function(data) {
                                                newDestination.querySelector("select.city").innerHTML = data;
                                            }
                                        });
                                    });

                                    // Initial remove buttons actions
                                    // $(document).on("click", ".remove-destination", function() {

                                    //     const totalRows = $(".destination-row").length;

                                    //     if (totalRows <= 1) {
                                    //         alert("At least one city is required.");
                                    //         return;
                                    //     }

                                    //     $(this).closest(".destination-row").remove();

                                    //     distributeNights(parseInt(document.getElementById("nights").value) || 0);

                                    //     fetchHotels();

                                    //     if (STATE_ID == 4) {

                                    //         const vehicleId = $(".vehicle-option:checked").val();
                                    //         const seaterId = $(".seater-option:checked").val() || 0;

                                    //         if (vehicleId) {
                                    //             loadTransfers(vehicleId, seaterId);
                                    //         }
                                    //     }
                                    // });

                                    // HANDLE REMOVE BUTTON VISIBILITY ONLY
                                    function toggleRemoveButtons() {

                                        // ONLY hide remove button of first row
                                        $("#destinationContainer .destination-row:first")
                                            .find(".remove-destination")
                                            .css("visibility", "hidden");

                                        // Show remove buttons for other rows
                                        $("#destinationContainer .destination-row:not(:first)")
                                            .find(".remove-destination")
                                            .css("visibility", "visible");
                                    }


                                    // INITIAL LOAD
                                    toggleRemoveButtons();


                                    // AFTER ADDING ROW
                                    document.getElementById("addDestination")
                                        .addEventListener("click", function() {

                                            setTimeout(function() {

                                                toggleRemoveButtons();

                                            }, 100);
                                        });


                                    // REMOVE DESTINATION
                                    $(document).on("click", "#destinationContainer .remove-destination", function() {

                                        const totalRows =
                                            $("#destinationContainer .destination-row").length;

                                        // Prevent deleting last row
                                        if (totalRows <= 1) {

                                            return false;
                                        }

                                        // Remove selected row
                                        $(this).closest(".destination-row").remove();

                                        // Reapply button visibility
                                        toggleRemoveButtons();

                                        // Recalculate nights
                                        distributeNights(
                                            parseInt($("#nights").val()) || 0
                                        );

                                        // Refresh hotels
                                        fetchHotels();

                                        // Reload transfers
                                        //if (STATE_ID == 4) {

                                        const vehicleId =
                                            $(".vehicle-option:checked").val();

                                        const seaterId =
                                            $(".seater-option:checked").val() || 0;

                                        if (vehicleId) {

                                            loadTransfers(vehicleId, seaterId);
                                        }
                                        //  }
                                    });
                                </script>



                                <!-- Other Information -->
                                <div class="row g-4 mt-7 ">
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="rooms" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-bed"></i> Rooms</label>
                                        <div class="animated-border-wrapper">

                                            <?php
                                            $selectedRoom = '';

                                            if (!empty($quotation_id)) {
                                                $sql = "SELECT * FROM quatation WHERE id = '$quotation_id'";
                                                $result = mysqli_query($conn, $sql);
                                                $row = mysqli_fetch_assoc($result);
                                                $selectedRoom = $row['rooms'];
                                            }
                                            ?>


                                            <select id="rooms" name="rooms" class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px] ">
                                                <?php
                                                for ($i = 1; $i <= 50; $i++) {
                                                    $selected = ($i == $selectedRoom) ? "selected" : "";
                                                    echo "<option value='$i' $selected>$i</option>";
                                                }
                                                ?>
                                            </select>
                                        </div>
                                    </div>


                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="pax" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-users"></i> Total Person</label>
                                        <div class="animated-border-wrapper">


                                            <?php

                                            if (!empty($quotation_id)) {
                                                $sql = "SELECT * FROM quatation WHERE id = '$quotation_id'";
                                                $result = mysqli_query($conn, $sql);
                                                $row = mysqli_fetch_assoc($result);
                                                $selectedRoom = $row['pax'];
                                            ?>

                                                <select id="pax" name="pax" class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px] ">

                                                    <option value='1'>1 PAX</option>
                                                    <?php
                                                    for ($i = 2; $i <= 100; $i += 2) {
                                                        $selected = ($i == $selectedRoom) ? "selected" : "";
                                                        echo "<option value='$i' $selected>$i PAX</option>";
                                                    }
                                                    ?>
                                                </select>
                                            <?php


                                            } else {
                                            ?>


                                                <select id="pax" name="pax" class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px] "></select>


                                            <?php } ?>

                                        </div>
                                    </div>


                                    <script>
                                        const selectElement = document.getElementById("pax");
                                        
                                           let option = document.createElement("option");
                                            option.value = 1;
                                            option.textContent = 1 + " PAX";
                                            selectElement.appendChild(option);
                                        

                                        for (let i = 2; i <= 100; i += 2) {
                                            let option = document.createElement("option");
                                            option.value = i;
                                            option.textContent = i + " PAX";
                                            selectElement.appendChild(option);
                                        }
                                    </script>

                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="mealPlan" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-utensils"></i> Meal Plan</label>
                                        <div class="animated-border-wrapper">




                                            <?php
                                            $selectedMealId = '';
                                            if (!empty($quotation_id)) {
                                                // Get selected meal plan ID from quatation table
                                                $selectedMealId = null;
                                                $stmt = $conn->prepare("SELECT mealPlan FROM quatation WHERE id = ?");
                                                $stmt->bind_param("i", $quotation_id);
                                                $stmt->execute();
                                                $result = $stmt->get_result();
                                                if ($row = $result->fetch_assoc()) {
                                                    $selectedMealId = $row['mealPlan'];
                                                }
                                                $stmt->close();
                                            }
                                            ?>


                                            <select id="mealPlan" name="mealPlan" class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px] ">
                                                <?php
                                                $sql = "SELECT * FROM plan";
                                                $result = mysqli_query($conn, $sql);
                                                while ($row = mysqli_fetch_assoc($result)) {
                                                    $selected = (isset($_GET['mealplan']) && $row['id'] == $_GET['mealplan']) ? 'selected' : '';

                                                    if (empty($selected)) {
                                                        $selected = ($row['id'] == $selectedMealId) ? 'selected' : '';
                                                    }
                                                    echo "<option value='" . htmlspecialchars($row['id']) . "' $selected>" . htmlspecialchars($row['mealplan']) . "</option>";
                                                }
                                                ?>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row g-4 mt-4">
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="extraAdult" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-user-plus"></i> Extra Adult</label>
                                        <div class="animated-border-wrapper">



                                            <?php
                                            $extraAdult = '';
                                            if (!empty($quotation_id)) {
                                                $sql = "SELECT extraAdult FROM quatation WHERE id = '$quotation_id'";
                                                $result = mysqli_query($conn, $sql);
                                                $row = mysqli_fetch_assoc($result);
                                                $extraAdult = $row['extraAdult'] ?? 0;
                                            }
                                            ?>


                                            <input value="<?php echo $extraAdult; ?>" type="number" id="extraAdult" name="extraAdult" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]">
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="childBed" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-child-reaching"></i> Children (Age 4-12)</label>
                                        <div class="animated-border-wrapper">


                                            <?php
                                            $childBed = '';
                                            if (!empty($quotation_id)) {
                                                $sql = "SELECT childBed FROM quatation WHERE id = '$quotation_id'";
                                                $result = mysqli_query($conn, $sql);
                                                $row = mysqli_fetch_assoc($result);
                                                $childBed = $row['childBed'] ?? 0;
                                            }
                                            ?>


                                            <input value="<?php echo $childBed; ?>" type="number" id="childBed" name="childBed" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]">
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="markup" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-percent"></i> Markup</label>
                                        <div class="animated-border-wrapper">


                                            <?php
                                            $markup = '%'; // default

                                            if (!empty($quotation_id)) {
                                                $stmt = $conn->prepare("SELECT markup FROM quatation WHERE id = ?");
                                                $stmt->bind_param("i", $quotation_id);
                                                $stmt->execute();
                                                $result = $stmt->get_result();

                                                if ($result && $result->num_rows > 0) {
                                                    $row = $result->fetch_assoc();
                                                    $markup = $row['markup'];
                                                }
                                                $stmt->close();
                                            }
                                            ?>


                                            <select id="markup" name="markup" class="form-select w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px] ">
                                                <option value="%" <?= $markup == '%' ? 'selected' : '' ?>>%</option>
                                                <option value="₹" <?= $markup == '₹' ? 'selected' : '' ?>>₹</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label for="totalMarkup" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-indian-rupee-sign"></i> Total Markup</label>
                                        <div class="animated-border-wrapper">


                                            <?php
                                            if (!empty($quotation_id)) {
                                                $sql = "SELECT totalMarkup FROM quatation WHERE id = '$quotation_id'";
                                                $result = mysqli_query($conn, $sql);
                                                $totalMarkupRow = mysqli_fetch_assoc($result);
                                            }
                                            ?>


                                            <input value="<?php echo !empty($totalMarkupRow) ? $totalMarkupRow['totalMarkup'] : ""; ?>" type="number" id="totalMarkup" name="totalMarkup" class="form-control w-full rounded-xl border border-gray-300 px-4 py-3 min-h-[52px]">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- =========================
SECTION : VEHICLE
========================= -->

                            <div class="premium-section flex items-center gap-4 mb-8">

                                <div class="premium-icon orange">
                                    <i class="fa-solid fa-car-side"></i>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-bold text-gray-800">Transfers & Vehicles</h3>
                                    <p class="text-gray-500">Pickup, drop and transport options</p>
                                </div>

                            </div>

                            <?php
                               $selectedSeater = 0;
                            $selectedVehicle = 0;
                            $selectedQuantity = 1;
                            $selectedSeater = 0;
                            $selectedPickupId = null;
                            $selectedDropId = null;
                            $selectedTransfers = [];

                            $state_id = intval($state_id);

                            // ✅ UPDATED SINGLE QUERY
                            $stmt = $conn->prepare("
    SELECT 
        vehicle_id,
        vehicleQuantity,
        pickup_id,
        drop_id,
        seater_id
    FROM quatation 
    WHERE id = ?
");

                            if (!empty($quotation_id)) {
                                $stmt->bind_param("i", $quotation_id);
                                $stmt->execute();
                                $result = $stmt->get_result();

                                while ($row = $result->fetch_assoc()) {

                                    $selectedVehicle = $row['vehicle_id'] ?? 0;
                                    $selectedQuantity = $row['vehicleQuantity'] ?? 1;

                                    // If seater exists in your table, include it in SELECT
                                    if (isset($row['seater_id']) && !empty($row['seater_id'])) {
                                        $selectedSeater = $row['seater_id'];
                                    }

                                    if (!empty($row['pickup_id']) && $row['pickup_id'] != 0) {
                                        $selectedPickupId = $row['pickup_id'];
                                    }

                                    if (!empty($row['drop_id']) && $row['drop_id'] != 0) {
                                        $selectedDropId = $row['drop_id'];
                                    }

                                    if (!empty($row['transfer_id'])) {
                                        $selectedTransfers[] = $row['transfer_id'];
                                    }
                                }

                                $stmt->close();
                            }




                         
                            $selectedTransfers = [];

                            if (!empty($quotation_id)) {

                                $transferQuery = mysqli_query(
                                    $conn,
                                    "SELECT * 
         FROM quatation_transfers
         WHERE quotation_id = '$quotation_id'"
                                );

                                while ($transferRow = mysqli_fetch_assoc($transferQuery)) {

                                    // SINGLE SEATER
                                    if (!empty($transferRow['seater'])) {

                                        $selectedSeater = $transferRow['seater'];
                                    }

                                    // MULTIPLE TRANSFERS
                                    if (!empty($transferRow['transfer_id'])) {

                                        $selectedTransfers[] = [
                                            'transfer_id' => $transferRow['transfer_id'],
                                            'city_id'     => $transferRow['city_id']
                                        ];
                                    }
                                }
                            }












                            $existingItinerary = [];

                            if (!empty($quotation_id)) {

                                $query = mysqli_query(
                                    $conn,
                                    "SELECT *
         FROM quatation_activities
         WHERE quotation_id = '$quotation_id'
         ORDER BY day_number ASC, sort_order ASC"
                                );

                                while ($row = mysqli_fetch_assoc($query)) {

                                    $day =
                                        (int)$row['day_number'];

                                    if (!isset($existingItinerary[$day])) {

                                        $existingItinerary[$day] = [

                                            'city_id' => $row['city_id'],

                                            'activity_date' =>
                                            $row['activity_date'],

                                            'notes' =>
                                            $row['notes'],

                                            'activities' => []
                                        ];
                                    }

                                    // IGNORE EMPTY ACTIVITY
                                    if (!empty($row['activity_id'])) {

                                        $existingItinerary[$day]['activities'][] =
                                            $row['activity_id'];
                                    }
                                }
                            }
                            ?>


                            <div class="bg-[#FFF8EB] xl:py-15 xl:px-12.5 sm:p-7.5 p-5 rounded-3xl mt-8">
                                <!-- VEHICLE, PICKUP, SEATER, TRANSFER, EXTRA ACTIVITY SECTION -->
                                <div class="row g-4 mt-4">
                                    <!-- VEHICLE DROPDOWN -->
                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <div id="hiddenTransfersContainer"></div>
                                        <label for="vehicle" class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"> <i class="fa-solid fa-car-side"></i> Vehicle</label>
                                        <div class="transfer-dropdown animated-border-wrapper">

                                            <button class="btn btn-secondary dropdown-toggle w-100 text-start"
                                                type="button"
                                                id="vehicleDropdown"
                                                data-bs-toggle="dropdown"
                                                data-bs-auto-close="outside"
                                                aria-expanded="false">

                                                Select Vehicle
                                            </button>

                                            <ul class="dropdown-menu p-0 w-100"
                                                id="vehicleList"
                                                aria-labelledby="vehicleDropdown"
                                                style="
            min-width: 350px;
            max-height: 400px;
            overflow: hidden;
        ">

                                                <!-- SCROLLABLE VEHICLE AREA -->
                                                <div style="
            max-height: 320px;
            overflow-y: auto;
            padding: 8px;
        ">

                                                    <?php
                                                    $sql = "SELECT id, name FROM vehicle";
                                                    $result = mysqli_query($conn, $sql);

                                                    if (mysqli_num_rows($result) > 0) {

                                                        while ($row = mysqli_fetch_assoc($result)) {

                                                            echo "

                    <li class='dropdown-item p-2 vehicle-item cursor-pointer'>

                        <div class='d-flex justify-content-between align-items-start w-100'>

                            <!-- VEHICLE OPTION -->
                            <div class='d-flex align-items-start flex-grow-1'>

                                <input class='form-check-input vehicle-option me-2 mt-1'
                                       type='radio'
                                       name='vehicle'
                                       id='vehicle_{$row['id']}'
                                       value='{$row['id']}'
                                       onclick='event.stopPropagation();'>

                                <label class='form-check-label mb-0 flex-grow-1'
                                       for='vehicle_{$row['id']}'
                                       onclick='event.stopPropagation();'
                                       style='
                                            white-space: normal;
                                            word-break: break-word;
                                            overflow-wrap: anywhere;
                                            cursor:pointer;
                                       '>

                                    {$row['name']}

                                </label>

                            </div>

                            <!-- QUANTITY -->
                            <div class='vehicle-quantity d-flex align-items-center ms-2 flex-shrink-0'
                                 style='width:110px;'>

                                <div class='input-group input-group-sm'
                                     style='width:auto;'>

                                    <button type='button'
                                            class='btn btn-outline-dark bg-white text-dark qty-decrease'
                                            data-target='vehicleQty_{$row['id']}'
                                           >

                                        -

                                    </button>

                                    <input type='text'
                                           id='vehicleQty_{$row['id']}'
                                           name='vehicle_quantity[{$row['id']}]'
                                           class='form-control text-center vehicleQtyInput border border-dark fw-bold vehicle-qty-input'
                                           value='1'
                                           min='1'
                                           max='10'
                                           readonly
                                           onclick='event.stopPropagation();'
                                           style='
                                                max-width:40px;
                                                background-color:#fff;
                                           '>

                                    <button type='button'
                                            class='btn btn-outline-dark bg-white text-dark qty-increase'
                                            data-target='vehicleQty_{$row['id']}'
                                          >

                                        +

                                    </button>

                                </div>

                            </div>

                        </div>

                    </li>";
                                                        }
                                                    } else {

                                                        echo "
                <li class='dropdown-item text-muted'>
                    No vehicles available for this state
                </li>";
                                                    }
                                                    ?>

                                                </div>

                                                <!-- FIXED DONE BUTTON -->
                                                <div style="
            position: sticky;
            bottom: 0;
            background: #fff;
            border-top: 1px solid #ddd;
            padding: 10px;
            z-index: 20;
        ">

                                                    <button type="button"
                                                        class="btn btn-primary rounded-xl px-6 py-3 w-100"
                                                        id="closeVehicleDropdown">

                                                        Done

                                                    </button>

                                                </div>

                                            </ul>

                                        </div>
                                    </div>
                                    <!-- PICKUP DROPDOWN (STATE WISE ONLY) -->

                                    <?php
                                    // Make sure $state_id is set (fallback optional)
                                    $state_id = isset($state_id) ? (int)$state_id : 0;

                                    $stmt = $conn->prepare("SELECT id, name FROM pickupdrop WHERE state_id = ? ORDER BY name ASC");
                                    $stmt->bind_param("i", $state_id);
                                    $stmt->execute();
                                    $result = $stmt->get_result();
                                    ?>

                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label class="form-label flex items-center gap-2 mb-2 font-medium text-gray-700"><i class="fa-solid fa-location-arrow"></i> Pickup</label>

                                        <div class="transfer-dropdown animated-border-wrapper">
                                            <button class="btn btn-secondary dropdown-toggle" type="button"
                                                id="pickupDropdown" data-bs-toggle="dropdown">
                                                Select Pickup
                                            </button>

                                            <ul class="dropdown-menu" id="pickupList">

                                                <?php if ($result && $result->num_rows > 0): ?>

                                                    <?php while ($row = $result->fetch_assoc()): ?>
                                                        <li>
                                                            <div class="form-check ms-2">
                                                                <input class="form-check-input pickup-option pickupdrop-option"
                                                                    type="radio"
                                                                    name="pickup"
                                                                    id="pickup_<?php echo $row['id']; ?>"
                                                                    value="<?php echo $row['id']; ?>">

                                                                <label class="form-check-label"
                                                                    for="pickup_<?php echo $row['id']; ?>">
                                                                    <?php echo htmlspecialchars($row['name']); ?>
                                                                </label>
                                                            </div>
                                                        </li>
                                                    <?php endwhile; ?>

                                                <?php else: ?>

                                                    <!-- ✅ No pickup found -->
                                                    <li class="px-3 text-muted">No pickup available</li>

                                                <?php endif; ?>

                                            </ul>
                                        </div>
                                    </div>




                                    <!-- CONDITIONAL PICKUP DROP -->
                                    <?php
                                    // Make sure $state_id is set (fallback optional)
                                    $state_id = isset($state_id) ? (int)$state_id : 0;

                                    $stmt = $conn->prepare("SELECT id, name FROM pickupdrop WHERE state_id = ? ORDER BY name ASC");
                                    $stmt->bind_param("i", $state_id);
                                    $stmt->execute();
                                    $result = $stmt->get_result();
                                    ?>

                                    <div class="w-full md:w-1/3 xl:w-[32%]">
                                        <label class="form-label"> <i class="fa-solid fa-route"></i> Drop</label>

                                        <div class="transfer-dropdown animated-border-wrapper">
                                            <button class="btn btn-secondary dropdown-toggle" type="button"
                                                id="dropDropdown" data-bs-toggle="dropdown">
                                                Select Drop
                                            </button>

                                            <ul class="dropdown-menu" id="dropList">

                                                <?php if ($result && $result->num_rows > 0): ?>

                                                    <?php while ($row = $result->fetch_assoc()): ?>
                                                        <li>
                                                            <div class="form-check ms-2">
                                                                <input class="form-check-input drop-option pickupdrop-option"
                                                                    type="radio"
                                                                    name="drop"
                                                                    id="drop_<?php echo $row['id']; ?>"
                                                                    value="<?php echo $row['id']; ?>">

                                                                <label class="form-check-label"
                                                                    for="drop_<?php echo $row['id']; ?>">
                                                                    <?php echo htmlspecialchars($row['name']); ?>
                                                                </label>
                                                            </div>
                                                        </li>
                                                    <?php endwhile; ?>

                                                <?php else: ?>

                                                    <!-- ✅ No pickup found -->
                                                    <li class="px-3 text-muted">No pickup available</li>

                                                <?php endif; ?>

                                            </ul>
                                        </div>
                                    </div>

                                    <!-- SEATER DROPDOWN (ul/li style) -->
                                    <div class="col-md-2" id="seater-wrapper" style="display: none;">
                                        <label for="seater" class="form-label"><i class="fa-solid fa-users-viewfinder"></i> Seater</label>
                                        <div class="transfer-dropdown animated-border-wrapper">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" id="seaterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                                Select Seater
                                            </button>
                                            <ul class="dropdown-menu" id="seaterList" aria-labelledby="seaterDropdown"></ul>
                                        </div>
                                    </div>

                                    <!-- TRANSFER DROPDOWN -->
                                    <div class="w-full md:w-1/3 xl:w-[32%]" id="transfer-wrapper">
                                        <label for="transfer" class="form-label"><i class="fa-solid fa-plane"></i> Select Transfer</label>
                                        <div class="transfer-dropdown animated-border-wrapper">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" id="transferDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                                Select Transfers
                                            </button>
                                            <ul class="dropdown-menu" id="transferList" aria-labelledby="transferDropdown"></ul>
                                        </div>
                                    </div>
                                </div>





                                <script>
                                    const STATE_ID = <?php echo (int)$state_id; ?>;


                                    // EXISTING VALUES
                                    const EXISTING_VEHICLE = <?php echo (int)$selectedVehicle; ?>;
                                    const EXISTING_SEATER =
                                        <?php echo (int)$selectedSeater; ?>;

                                    const EXISTING_TRANSFERS =
                                        <?php echo json_encode($selectedTransfers); ?>;




                                    document.addEventListener("DOMContentLoaded", function() {

                                        // VEHICLE SELECT
                                        // document.querySelectorAll(".vehicle-option").forEach(radio => {
                                        //     radio.addEventListener("change", function() {

                                        //         document.querySelectorAll(".vehicle-quantity")
                                        //             .forEach(q => q.classList.remove("active"));

                                        //         const vehicleItem = this.closest(".vehicle-item");

                                        //         if (vehicleItem) {
                                        //             vehicleItem.querySelector(".vehicle-quantity")
                                        //                 .classList.add("active");
                                        //         }

                                        //         $("#vehicleDropdown").text(
                                        //             $(this).siblings("label").text().trim()
                                        //         );

                                        //         const vehicleId = this.value;

                                        //         if (["9", "10", "11"].includes(vehicleId)) {
                                        //             $.post("get_seaters.php", {
                                        //                 vehicle_id: vehicleId
                                        //             }, function(data) {
                                        //                 $("#seaterList").html(data);
                                        //                 $("#seater-wrapper").show();
                                        //             });
                                        //         } else {
                                        //             $("#seater-wrapper").hide();

                                        //             if (STATE_ID == 4) {
                                        //                 loadTransfers(vehicleId, 0);
                                        //             }
                                        //         }
                                        //     });
                                        // });

                                        // PREVENT DROPDOWN FROM CLOSING
                                        $(document).on(
                                            "click",
                                            "#vehicleList, #vehicleList *",
                                            function(e) {

                                                e.stopPropagation();
                                            }
                                        );




                                        // PREVENT DROPDOWN FROM CLOSING ON INTERNAL CLICK
                                        $(document).on(
                                            "click",
                                            "#vehicleList, #vehicleList *",
                                            function(e) {

                                                e.stopPropagation();
                                            }
                                        );


                                        // DONE BUTTON CLOSE
                                        $(document).on(
                                            "click",
                                            "#closeVehicleDropdown",
                                            function(e) {

                                                e.preventDefault();

                                                e.stopPropagation();

                                                const dropdownEl =
                                                    document.getElementById("vehicleDropdown");

                                                const dropdown =
                                                    bootstrap.Dropdown.getOrCreateInstance(
                                                        dropdownEl
                                                    );

                                                dropdown.hide();
                                            }
                                        );




                                        // MANUALLY CLOSE ON DONE BUTTON
                                        $(document).on("click", "#closeVehicleDropdown", function(e) {

                                            e.preventDefault();
                                            e.stopPropagation();

                                            // Allow close
                                            window.allowVehicleDropdownClose = true;

                                            const dropdown =
                                                bootstrap.Dropdown.getInstance(
                                                    document.getElementById("vehicleDropdown")
                                                );

                                            if (dropdown) {

                                                dropdown.hide();
                                            }
                                        });


                                        // VEHICLE SELECT
                                        $(document).on("change", ".vehicle-option", function(e) {

                                            e.preventDefault();
                                            e.stopPropagation();

                                            $(".vehicle-quantity").removeClass("active");

                                            const vehicleItem =
                                                $(this).closest(".vehicle-item");

                                            vehicleItem
                                                .find(".vehicle-quantity")
                                                .addClass("active");

                                            let vehicleName =
                                                $(this)
                                                .siblings("label")
                                                .text()
                                                .trim();

                                            let qty =
                                                vehicleItem
                                                .find(".vehicle-qty-input")
                                                .val() || 1;

                                            $("#vehicleDropdown").text(
                                                vehicleName + " (" + qty + ")"
                                            );

                                            const vehicleId = $(this).val();

                                            $.post("get_seaters.php", {
                                                vehicle_id: vehicleId
                                            }, function(data) {

                                                // VEHICLE HAS SEATER
                                                if (data != "No seater available") {

                                                    $("#seaterList").html(data);

                                                    $("#seater-wrapper").show();

                                                    // EXISTING SEATER
                                                    if (EXISTING_SEATER > 0) {

                                                        let seaterInput =
                                                            $(".seater-option[value='" +
                                                                EXISTING_SEATER + "']");

                                                        if (seaterInput.length) {

                                                            seaterInput.prop("checked", true);

                                                            let seaterText =
                                                                seaterInput
                                                                .siblings("label")
                                                                .text()
                                                                .trim();

                                                            $("#seaterDropdown").text(seaterText);

                                                            // LOAD TRANSFERS
                                                            //  if (STATE_ID == 4) {

                                                            loadTransfers(
                                                                vehicleId,
                                                                EXISTING_SEATER
                                                            );
                                                            //  }
                                                        }

                                                    } else {

                                                        // NO EXISTING SEATER
                                                        //  if (STATE_ID == 4) {

                                                        loadTransfers(vehicleId, 0);
                                                        //   }
                                                    }

                                                } else {

                                                    // NO SEATER AVAILABLE
                                                    $("#seater-wrapper").hide();

                                                    if ($(".seater-option:checked").length) {
                                                        $(".seater-option:checked").val(0);
                                                    }
                                                    //if (STATE_ID == 4) {

                                                    loadTransfers(vehicleId, 0);
                                                    //  }
                                                }
                                            });
                                        });

                                        // KEEP ONLY THIS
                                        $(document).on(
                                            "click",
                                            "#vehicleList, #vehicleList *",
                                            function(e) {

                                                e.stopPropagation();
                                            }
                                        );


                                        // NOW THIS WILL WORK
                                        $(document).on("click", ".qty-increase, .qty-decrease", function(e) {

                                            e.preventDefault();
                                            e.stopPropagation();

                                            console.log("clicked"); // now this will run

                                            const button = $(this);

                                            const targetId =
                                                button.attr("data-target");

                                            const input =
                                                $("#" + targetId);

                                            let val =
                                                parseInt(input.val()) || 1;

                                            // INCREASE
                                            if (
                                                button.hasClass("qty-increase") &&
                                                val < 10
                                            ) {

                                                val++;
                                            }

                                            // DECREASE
                                            if (
                                                button.hasClass("qty-decrease") &&
                                                val > 1
                                            ) {

                                                val--;
                                            }

                                            // UPDATE INPUT
                                            input.val(val);

                                            // UPDATE TEXT
                                            const vehicleItem =
                                                button.closest(".vehicle-item");

                                            if (vehicleItem.length) {

                                                const vehicleName =
                                                    vehicleItem
                                                    .find("label")
                                                    .first()
                                                    .text()
                                                    .trim();

                                                $("#vehicleDropdown").text(
                                                    vehicleName + " (" + val + ")"
                                                );
                                            }
                                        });
                                        // REMOVE THIS OLD CODE COMPLETELY
                                        /*
                                        document.addEventListener("click", function(e) {
                                            if (e.target.classList.contains("qty-increase") || e.target.classList.contains("qty-decrease")) {

                                                let input = document.getElementById(e.target.dataset.target);
                                                let val = parseInt(input.value) || 1;

                                                if (e.target.classList.contains("qty-increase") && val < 10) val++;
                                                if (e.target.classList.contains("qty-decrease") && val > 1) val--;

                                                input.value = val;
                                            }
                                        });
                                        */

                                        // SEATER CHANGE
                                        $(document).on("change", ".seater-option", function() {
                                            const vehicleId = $(".vehicle-option:checked").val();

                                            //  if (STATE_ID == 4) {
                                            loadTransfers(vehicleId, $(this).val());
                                            //   }
                                        });






                                        // PICKUP / DROP
                                        $(document).on("click", ".pickup-option", function() {

                                            $("#pickupDropdown").text(
                                                $(this).siblings("label").text().trim()
                                            );

                                            resetTransfers();

                                            // if (STATE_ID == 4) {
                                            const vehicleId = $(".vehicle-option:checked").val();
                                            const seaterId = $(".seater-option:checked").val() || 0;
                                            loadTransfers(vehicleId, seaterId);
                                            //   }
                                        });

                                        $(document).on("change", ".drop-option", function() {

                                            $("#dropDropdown").text(
                                                $(this).siblings("label").text().trim()
                                            );

                                            resetTransfers();

                                            //  if (STATE_ID == 4) {
                                            const vehicleId = $(".vehicle-option:checked").val();
                                            const seaterId = $(".seater-option:checked").val() || 0;
                                            loadTransfers(vehicleId, seaterId);
                                            //  }
                                        });



                                        $(document).on("click", "#pickupList label", function() {

                                            setTimeout(function() {

                                                const vehicleId = $(".vehicle-option:checked").val();
                                                const seaterId = $(".seater-option:checked").val() || 0;

                                                loadTransfers(vehicleId, seaterId);

                                            }, 50);

                                        });

                                        $(document).on("click", "#dropList label", function() {

                                            setTimeout(function() {

                                                const vehicleId = $(".vehicle-option:checked").val();
                                                const seaterId = $(".seater-option:checked").val() || 0;

                                                loadTransfers(vehicleId, seaterId);

                                            }, 50);

                                        });

                                        // CITY CHANGE
                                        $(document).on("change", ".city", function() {
                                            //  if (STATE_ID != 4) return;

                                            const vehicleId = $(".vehicle-option:checked").val();
                                            const seaterId = $(".seater-option:checked").val() || 0;

                                            if (vehicleId) {
                                                loadTransfers(vehicleId, seaterId);
                                            }
                                        });

                                    });

                                    // LOAD TRANSFER FUNCTION
                                    function loadTransfers(vehicleId, seaterId) {

                                        //  if (STATE_ID != 4) return;

                                        let cityIds = [];
                                        document.querySelectorAll(".city").forEach(c => {
                                            if (c.value) cityIds.push(c.value);
                                        });

                                        if (!vehicleId || cityIds.length === 0) {
                                            $("#transferList").html("<li>Select city & vehicle</li>");
                                            return;
                                        }

                                        $.ajax({
                                            url: "fetch_transfers.php",
                                            method: "POST",
                                            data: {
                                                vehicle_id: vehicleId,
                                                city_ids: cityIds.join(","),
                                                seater_id: seaterId,
                                                pickup_id: $(".pickup-option:checked").val() || 0,
                                                drop_id: $(".drop-option:checked").val() || 0,
                                                state_id: STATE_ID // ✅ ADD THIS
                                            },
                                            beforeSend: () => $("#transferList").html("<li>Loading...</li>"),
                                            success: function(res) {

                                                $("#transferList").html(res);

                                                // AUTO SELECT EXISTING TRANSFERS
                                                if (EXISTING_TRANSFERS.length > 0) {

                                                    let selectedTexts = [];

                                                    EXISTING_TRANSFERS.forEach(function(transferDetail) {

                                                        let transferInput =
                                                            $(".transfer-option[value='" + transferDetail.transfer_id + "']");

                                                        if (transferInput.length) {

                                                            transferInput.prop("checked", true);

                                                            selectedTexts.push(
                                                                transferInput
                                                                .siblings("label")
                                                                .text()
                                                                .trim()
                                                            );


                                                            $('.fetch_trans_container').append(`
                                                                <input
                                                                    type="hidden"
                                                                    name="transfers[]"
                                                                    value="${transferDetail.transfer_id }|${transferDetail.city_id}"
                                                                    class="generated-transfer"
                                                                    data-transfer="${transferDetail.transfer_id}"
                                                                >
                                                            `);

                                                        }
                                                    });

                                                    // UPDATE DROPDOWN BUTTON TEXT
                                                    if (selectedTexts.length > 0) {

                                                        $("#transferDropdown").text(
                                                            selectedTexts.join(", ")
                                                        );
                                                    }
                                                }
                                            },
                                            // success: res => $("#transferList").html(res),
                                            error: () => $("#transferList").html("<li>Error loading</li>")
                                        });
                                    } // RESET
                                    function resetTransfers() {
                                        $("#transferList").html("<li>Select transfer</li>");
                                        $("#hiddenTransfersContainer").html("");
                                    }


                                    $(document).ready(function() {

                                        if (EXISTING_VEHICLE > 0) {

                                            let vehicleInput =
                                                $(".vehicle-option[value='" + EXISTING_VEHICLE + "']");

                                            if (vehicleInput.length) {

                                                vehicleInput.prop("checked", true);

                                                // SHOW VEHICLE NAME
                                                let vehicleText = vehicleInput
                                                    .siblings("label")
                                                    .text()
                                                    .trim();

                                                let qty =
                                                    $("#vehicleQty_" + EXISTING_VEHICLE).val() || 1;

                                                $("#vehicleDropdown").text(
                                                    vehicleText + " (" + qty + ")"
                                                );

                                                // LOAD SEATER + TRANSFER
                                                vehicleInput.trigger("change");
                                            }
                                        }
                                    });
                                </script>
                                <!-- EXTRA ACTIVITIES -->
                                <br><br>


                            </div>
                            <!-- =========================
SECTION : ACTIVITIES
========================= -->

                            <!-- <div class="premium-section">

                                <div class="premium-icon green">
                                    <i class="fa-solid fa-person-hiking"></i>
                                </div>

                                <div>
                                    <h3>Activities</h3>
                                    <p>Add adventure and sightseeing activities</p>
                                </div>

                            </div> -->









                            <!-- =========================================================
DAY WISE ITINERARY
========================================================= -->

                            <div class="premium-section flex items-center gap-4 mb-8 mt-12">

                                <div class="premium-icon green">
                                    <i class="fa-solid fa-calendar-days"></i>
                                </div>

                                <div>
                                    <h3 class="text-2xl font-bold text-gray-800">
                                        Day Wise Itinerary
                                    </h3>

                                    <p class="text-gray-500">
                                        Add activities day wise
                                    </p>
                                </div>

                            </div>

                            <div class="bg-[#FFF8EB] rounded-3xl p-6 mt-6">

                                <div id="itineraryContainer">

                                    <div class="text-center text-gray-500 py-8">

                                        Select cities and nights first

                                    </div>

                                </div>

                            </div>



                            <!-- =========================================================
ACTIVITY DATA
========================================================= -->

                            <?php

                            $sql = "
SELECT
    a.id,
    a.name,
    c.id as city_id
FROM activity a
JOIN city c ON a.city_id = c.id
WHERE c.state_id = '$state_id'
ORDER BY a.name ASC
";

                            $result = mysqli_query($conn, $sql);

                            $activityData = [];

                            while ($row = mysqli_fetch_assoc($result)) {

                                $cityId = $row['city_id'];

                                if (!isset($activityData[$cityId])) {

                                    $activityData[$cityId] = [];
                                }

                                $activityData[$cityId][] = [
                                    'id' => $row['id'],
                                    'name' => $row['name']
                                ];
                            }

                            ?>



                            <script>
                                const ACTIVITY_ARRIVAL = '<?= ACTIVITY_ARRIVAL ?>';
                                const ACTIVITY_DEPARTURE = '<?= ACTIVITY_DEPARTURE ?>';
                                var activityData =
                                    <?= json_encode($activityData); ?>;


                                /* =========================================================
                                GENERATE ITINERARY
                                ========================================================= */


                                function getDayDate(dayNumber) {

                                    let startDate =
                                        $("#travelDate").val();

                                    if (!startDate) return "";

                                    let date =
                                        new Date(startDate);

                                    date.setDate(
                                        date.getDate() + (dayNumber - 1)
                                    );

                                    return date.toISOString()
                                        .split("T")[0];
                                }

                                const EXISTING_ITINERARY =
                                    <?php echo json_encode($existingItinerary); ?>;


                                function formatDayDate(dateString) {

                                    if (!dateString) return "";

                                    let date =
                                        new Date(dateString);

                                    let dayName =
                                        date.toLocaleDateString(
                                            "en-US", {
                                                weekday: "long"
                                            }
                                        );

                                    let month =
                                        date.toLocaleDateString(
                                            "en-US", {
                                                month: "long"
                                            }
                                        );

                                    let day =
                                        date.getDate();

                                    let year =
                                        date.getFullYear();

                                    // ORDINAL
                                    let suffix = "th";

                                    if (
                                        day % 10 == 1 &&
                                        day != 11
                                    ) {
                                        suffix = "st";
                                    } else if (
                                        day % 10 == 2 &&
                                        day != 12
                                    ) {
                                        suffix = "nd";
                                    } else if (
                                        day % 10 == 3 &&
                                        day != 13
                                    ) {
                                        suffix = "rd";
                                    }

                                    return `
${dayName}, ${month} ${day}${suffix}, ${year}
`;
                                }

                                function generateItinerary() {

                                    let html = "";

                                    let day = 1;

                                    $("#destinationContainer .destination-row").each(function() {

                                        let cityId =
                                            $(this)
                                            .find(".city")
                                            .val();

                                        let cityName =
                                            $(this)
                                            .find(".city option:selected")
                                            .text();

                                        let nights =
                                            parseInt(
                                                $(this)
                                                .find("input[name='nights[]']")
                                                .val()
                                            ) || 0;

                                        if (
                                            !cityId ||
                                            nights <= 0
                                        ) {
                                            return;
                                        }

                                        /* ACTIVITIES ARRAY */

                                        let cityActivities =
                                            activityData[cityId] || [];

                                        let arrivalActivity =
                                            cityActivities.find(
                                                a =>
                                                a.name.trim().toLowerCase() ===
                                                ACTIVITY_ARRIVAL.toLowerCase()
                                            );

                                        let departureActivity =
                                            cityActivities.find(
                                                a =>
                                                a.name.trim().toLowerCase() ===
                                                ACTIVITY_DEPARTURE.toLowerCase()
                                            );

                                        /* FIRST ACTIVITY */

                                        let firstActivity =
                                            cityActivities.length > 0 ?
                                            cityActivities[0] :
                                            null;

                                        /* LAST ACTIVITY */

                                        let lastActivity =
                                            cityActivities.length > 0 ?
                                            cityActivities[
                                                cityActivities.length - 1
                                            ] :
                                            null;

                                        /* AREA */

                                        html += `

<div class="itinerary-area">

    <div class="itinerary-area-header">

        <i class="fa-solid fa-location-dot"></i>

        ${cityName} | ${nights}N   <div class="itinerary-area-date">

        ${formatDayDate(getDayDate(day))}

    </div>

    </div>

        `;

                                        /* DAYS */

                                        for (let i = 1; i <= nights; i++) {

                                            // let existingDay =
                                            //     EXISTING_ITINERARY[day] || null;
                                            let existingDay = null;

                                            if (!window.ITINERARY_INITIALIZED) {

                                                existingDay =
                                                    EXISTING_ITINERARY[day] || null;
                                            }

                                            let existingActivities =
                                                existingDay ?
                                                existingDay.activities : [];

                                            let existingNotes =
                                                existingDay ?
                                                existingDay.notes : "";

                                            let existingDate =
                                                existingDay ?
                                                existingDay.activity_date :
                                                getDayDate(day);

                                            let options = `
<option value="">Select Activity</option>
            `;

                                            /* DROPDOWN OPTIONS */

                                            cityActivities.forEach(function(activity) {


                                                // SKIP ARRIVAL / DEPARTURE
                                                if (
                                                    activity.name.trim().toLowerCase() ===
                                                    ACTIVITY_ARRIVAL.toLowerCase() ||
                                                    activity.name.trim().toLowerCase() ===
                                                    ACTIVITY_DEPARTURE.toLowerCase()
                                                ) {

                                                    return;
                                                }


                                                options += `

<option value="${activity.id}">

    ${activity.name}

</option>

                `;
                                            });

                                            /* =====================================
                                               AUTO SELECT ACTIVITIES
                                            ===================================== */

                                            let autoActivities = "";

                                            /* =====================================
                                               EXISTING ACTIVITIES
                                            ===================================== */

                                            if (existingActivities.length > 0) {

                                                existingActivities.forEach(function(activityId) {

                                                    let activity =
                                                        cityActivities.find(a =>
                                                            a.id == activityId
                                                        );

                                                    if (activity) {

                                                        autoActivities += `

<div
    class="selectedActivity
    ${
        activity.name.trim().toLowerCase() ===
        ACTIVITY_ARRIVAL.toLowerCase()
        ||
        activity.name.trim().toLowerCase() ===
        ACTIVITY_DEPARTURE.toLowerCase()
        ? 'fixedActivity'
        : ''
    }"
    data-id="${activity.id}"
>

    <input
        type="hidden"
        name="itinerary[${day}][activities][]"
        value="${activity.id}"
    >

    <span>

        <i class="fa-solid fa-person-hiking"></i>

        ${activity.name}

    </span>

   ${
    activity.name.trim().toLowerCase() ===
    ACTIVITY_ARRIVAL.toLowerCase()
    ||
    activity.name.trim().toLowerCase() ===
    ACTIVITY_DEPARTURE.toLowerCase()
    ? ''
    : `
<button
    type="button"
    onclick="removeActivity(this)"
>

    <i class="fa-solid fa-xmark"></i>

</button>
`
}

</div>
`;
                                                    }
                                                });

                                            } else {

                                                /* =====================================
                                                   DEFAULT AUTO ACTIVITIES
                                                ===================================== */

                                                /* =====================================
ARRIVAL DAY
===================================== */

                                                if (day === 1) {

                                                    autoActivities += `

<div
    class="selectedActivity fixedActivity"
    data-fixed="1"
>

   <input
    type="hidden"
    name="itinerary[${day}][arrival_activity]"
    value="${
        arrivalActivity
        ? arrivalActivity.id
        : ''
    }"
>

    <span>

        <i class="fa-solid fa-plane-arrival"></i>

        ${ACTIVITY_ARRIVAL}

    </span>

</div>

`;
                                                }


                                            }
                                            /* EMPTY TEXT */

                                            if (autoActivities === "") {

                                                autoActivities = `

<div class="emptyActivities">

    No activities selected

</div>

                `;
                                            }

                                            /* DAY ROW */

                                            html += `

<div class="itinerary-day-row">

 <input
        type="hidden"
        name="itinerary[${day}][day_number]"
        value="${day}"
    >

    <input
        type="hidden"
        name="itinerary[${day}][activity_date]"
        value="${existingDate}"
    >

    <input
        type="hidden"
        name="itinerary[${day}][city_id]"
        value="${cityId}"
    >

    <!-- LEFT -->

    <div class="itinerary-day-left">

        <div class="itinerary-day-title">

            Day ${day}

        </div>

        

        <div class="itinerary-day-city">

            ${cityName}

        </div>

        <div class="itinerary-day-date">

    ${formatDayDate(existingDate)}

</div>

    </div>


    <!-- RIGHT -->

    <div class="itinerary-day-right">

        <!-- SELECTED -->

        <div
            class="selectedActivities"
            id="selectedActivities${day}"
        >

            ${autoActivities}

        </div>


        <!-- SELECT -->

        <select
            class="activitySelect"
            onchange="addActivity(this)"
            data-day="${day}"
        >

            ${options}

        </select>


        <!-- NOTES -->

       <textarea
    class="itineraryNotes"
    rows="3"
    name="itinerary[${day}][notes]"
    placeholder="Write notes..."
>${existingNotes}</textarea>

    </div>

</div>

            `;

                                            day++;


                                            /* =====================================
LAST CITY DEPARTURE DAY
===================================== */

                                            let isLastCity =
                                                $(this).is(
                                                    $("#destinationContainer .destination-row").last()
                                                );

                                            if (
                                                isLastCity &&
                                                i === nights
                                            ) {

                                                let departureDate =
                                                    getDayDate(day);




                                                autoActivities = '';

                                                let departureExistingDay =
                                                    EXISTING_ITINERARY[day] || null;

                                                /* EXISTING ACTIVITIES */
                                                if (
                                                    departureExistingDay &&
                                                    departureExistingDay.activities &&
                                                    departureExistingDay.activities.length > 0
                                                ) {

                                                    departureExistingDay.activities.forEach(function(activityId) {

                                                        let activity = cityActivities.find(
                                                            a => a.id == activityId
                                                        );


                                                        if (!activity) {
                                                            return;
                                                        }


                                                        /* SKIP DEPARTURE ACTIVITY */
                                                        if (
                                                            activity.name.trim().toLowerCase() ===
                                                            ACTIVITY_DEPARTURE.toLowerCase()
                                                        ) {
                                                            return;
                                                        }



                                                        if (activity) {

                                                            autoActivities += `

<div
    class="selectedActivity"
    data-id="${activity.id}"
>

    <input
        type="hidden"
        name="itinerary[${day}][activities][]"
        value="${activity.id}"
    >

    <span>

        <i class="fa-solid fa-person-hiking"></i>

        ${activity.name}

    </span>

    <button
        type="button"
        onclick="removeActivity(this)"
    >
        <i class="fa-solid fa-xmark"></i>
    </button>

</div>

`;
                                                        }

                                                    });
                                                }

                                                /* DEPARTURE ACTIVITY ALWAYS LAST */
                                                autoActivities += `

<div
    class="selectedActivity fixedActivity"
    data-fixed="1"
>

    <input
        type="hidden"
        name="itinerary[${day}][departure_activity]"
        value="${departureActivity ? departureActivity.id : ''}"
    >

    <span>

        <i class="fa-solid fa-plane-departure"></i>

        ${ACTIVITY_DEPARTURE}

    </span>

</div>

`;



                                                let departureNotes =
                                                    departureExistingDay ?
                                                    departureExistingDay.notes :
                                                    "";

                                                html += `

<div class="itinerary-day-row">

    <input
        type="hidden"
        name="itinerary[${day}][day_number]"
        value="${day}"
    >

    <input
        type="hidden"
        name="itinerary[${day}][activity_date]"
        value="${departureDate}"
    >

    <input
        type="hidden"
        name="itinerary[${day}][city_id]"
        value="${cityId}"
    >

    <div class="itinerary-day-left">

        <div class="itinerary-day-title">

            Day ${day}

        </div>

        <div class="itinerary-day-city">

            ${cityName}

        </div>

        <div class="itinerary-day-date">

   ${formatDayDate(getDayDate(day))}

</div>

    </div>

    <div class="itinerary-day-right">
    
  <div
            class="selectedActivities"
            id="selectedActivities${day}"
        >

            ${autoActivities}

        </div>

<select
    class="activitySelect"
    onchange="addActivity(this)"
    data-day="${day}"
>

    ${options}

</select>



        <textarea
            class="itineraryNotes"
            rows="3"
            name="itinerary[${day}][notes]"
            placeholder="Write notes..."
        >${departureNotes}</textarea>

    </div>

</div>

`;

                                                day++;
                                            }
                                        }

                                        html += `</div>`;
                                    });

                                    /* EMPTY */

                                    if (html === "") {

                                        html = `

<div class="text-center text-gray-500 py-8">

    Select cities and nights first

</div>

        `;
                                    }



                                    $("#itineraryContainer").html(html);




                                    window.ITINERARY_INITIALIZED = true;

                                    //  enableSorting();
                                }

                                /* =========================================================
                                ADD ACTIVITY
                                ========================================================= */

                                function addActivity(select) {
                                    let day = $(select).data("day");
                                    let activityId = $(select).val();
                                    let activityName = $(select).find("option:selected").text();
                                    let container = $("#selectedActivities" + day);

                                    if (!activityId) {
                                        return;
                                    }

                                    /* DUPLICATE CHECK */
                                    if (container.find('[data-id="' + activityId + '"]').length) {
                                        return;
                                    }



                                    let html = `

<div
    class="selectedActivity"
    data-id="${activityId}"
>

    <input
        type="hidden"
        name="itinerary[${day}][activities][]"
        value="${activityId}"
    >

    <span>

        <i class="fa-solid fa-person-hiking"></i>

        ${activityName}

    </span>

    <button
        type="button"
        onclick="removeActivity(this)"
    >

        <i class="fa-solid fa-xmark"></i>

    </button>

</div>

    `;

                                    // let html = `


                                    //     <div class="selectedActivity" data-id="${activityId}">
                                    //         <input type="hidden" name="itinerary[${day}][activities][]" value="${activityId}">
                                    //         <span>
                                    //             <i class="fa-solid fa-person-hiking"></i> ${activityName}
                                    //         </span>
                                    //         <button type="button" onclick="removeActivity(this)">
                                    //             <i class="fa-solid fa-xmark"></i>
                                    //         </button>
                                    //     </div>
                                    // `;

                                    // REMOVE EMPTY STATE WRAPPER IF PRESENT
                                    container.find(".emptyActivities").remove();

                                    // 🔥 CHANGE HERE: If a fixed Departure block exists, insert BEFORE it
                                    let departureBlock = container.find(".fixedActivity:contains('" + ACTIVITY_DEPARTURE + "')");
                                    if (departureBlock.length > 0) {
                                        departureBlock.before(html);
                                    } else {
                                        container.append(html);
                                    }

                                    $(select).val("");
                                }



                                /* =========================================================
                                REMOVE
                                ========================================================= */

                                //                                 function removeActivity(btn) {

                                //                                     let parent =
                                //                                         $(btn).closest(
                                //                                             ".selectedActivity"
                                //                                         );

                                //                                     let wrapper =
                                //                                         parent.parent();

                                //                                     parent.remove();

                                //                                     if (
                                //                                         wrapper.find(".selectedActivity")
                                //                                         .length === 0
                                //                                     ) {

                                //                                         wrapper.html(`

                                // <div class="emptyActivities">

                                //     No activities selected

                                // </div>

                                //         `);
                                //                                     }
                                //                                 }


                                function removeActivity(btn) {

                                    let parent =
                                        $(btn).closest(".selectedActivity");

                                    if (parent.hasClass("fixedActivity")) {

                                        return;
                                    }




                                    let wrapper =
                                        parent.parent();

                                    /* =====================================
                                       REMOVE FROM EXISTING_ITINERARY
                                    ===================================== */

                                    let activityId =
                                        parseInt(parent.attr("data-id"));

                                    let dayInput =
                                        parent.closest(".itinerary-day-row")
                                        .find('input[name*="[day_number]"]');

                                    let day =
                                        parseInt(dayInput.val());

                                    if (
                                        EXISTING_ITINERARY[day] &&
                                        EXISTING_ITINERARY[day].activities
                                    ) {

                                        EXISTING_ITINERARY[day].activities =
                                            EXISTING_ITINERARY[day].activities.filter(
                                                id => parseInt(id) !== activityId
                                            );
                                    }

                                    /* =====================================
                                       REMOVE HTML
                                    ===================================== */

                                    parent.remove();

                                    if (
                                        wrapper.find(".selectedActivity")
                                        .length === 0
                                    ) {

                                        wrapper.html(`

<div class="emptyActivities">

    No activities selected

</div>

        `);
                                    }
                                }



                                /* =========================================================
                                EVENTS
                                ========================================================= */

                                $(document).on(
                                    "change keyup",
                                    ".city, input[name='nights[]'],#travelEndDate,#travelDate",
                                    function() {

                                        generateItinerary();
                                    }
                                );


                                /* =========================================================
                                ADD DESTINATION
                                ========================================================= */

                                $("#addDestination").on(
                                    "click",
                                    function() {

                                        setTimeout(function() {

                                            generateItinerary();

                                        }, 800);
                                    }
                                );


                                /* =========================================================
                                REMOVE DESTINATION
                                ========================================================= */

                                $(document).on(
                                    "click",
                                    ".remove-destination",
                                    function() {

                                        setTimeout(function() {

                                            generateItinerary();

                                        }, 300);
                                    }
                                );


                                /* =========================================================
                                INITIAL LOAD
                                ========================================================= */

                                $(document).ready(function() {

                                    setTimeout(function() {

                                        generateItinerary();

                                    }, 1500);
                                });





                                /* =========================================================
ENABLE DRAG SORTING
========================================================= */

                                function enableSorting() {

                                    $(".selectedActivities").sortable({

                                        placeholder: "sortable-placeholder",

                                        cursor: "move",

                                        opacity: 0.9

                                    });
                                }
                            </script>



                            <style>
                                /* =========================================================
AREA
========================================================= */

                                .itinerary-area {

                                    background: #fff;

                                    border-radius: 20px;

                                    padding: 20px;

                                    margin-bottom: 30px;

                                    border: 1px solid #e5e7eb;
                                }

                                .itinerary-area-header {

                                    background: #eef2ff;

                                    border-radius: 14px;

                                    padding: 14px 18px;

                                    font-size: 20px;

                                    font-weight: 700;

                                    margin-bottom: 20px;

                                    display: flex;

                                    align-items: center;

                                    gap: 10px;
                                }


                                /* =========================================================
DAY ROW
========================================================= */

                                .itinerary-day-row {

                                    display: flex;

                                    gap: 20px;

                                    margin-bottom: 25px;
                                }

                                .itinerary-day-left {

                                    width: 250px;

                                    flex-shrink: 0;

                                    background: linear-gradient(135deg, #066168, #0d9488);
                                    padding: 16px;
                                    color: #fff;
                                    border-radius: 14px;
                                    display: flex;

                                    flex-direction: column;

                                    justify-content: center;

                                    align-items: center;

                                    text-align: center;
                                }

                                .itinerary-day-title {

                                    font-size: 24px;

                                    font-weight: 700;
                                }

                                .itinerary-day-city {

                                    color: #dfdfdf;
                                    font-size: 18px;
                                    font-weight: 600;
                                }

                                .itinerary-day-right {

                                    flex: 1;
                                }


                                /* =========================================================
SELECTED
========================================================= */

                                .selectedActivities {

                                    border: 1px solid #ddd;

                                    border-radius: 14px;

                                    padding: 12px;

                                    min-height: 65px;

                                    background: #fafafa;

                                    margin-bottom: 15px;
                                }

                                .selectedActivity {

                                    display: flex;

                                    justify-content: space-between;

                                    align-items: center;

                                    background: #fff;

                                    border: 1px solid #dbeafe;

                                    border-radius: 12px;

                                    padding: 10px 14px;

                                    margin-bottom: 10px;
                                }

                                .selectedActivity span {

                                    display: flex;

                                    align-items: center;

                                    gap: 10px;

                                    font-weight: 600;
                                }

                                .selectedActivity button {

                                    border: none;

                                    background: none;

                                    color: red;
                                }


                                /* =========================================================
SELECT
========================================================= */

                                .activitySelect {

                                    width: 100%;

                                    border: 1px solid #ddd;

                                    border-radius: 14px;

                                    padding: 14px;

                                    background: #fff;

                                    margin-bottom: 15px;
                                }


                                /* =========================================================
TEXTAREA
========================================================= */

                                .itineraryNotes {

                                    width: 100%;

                                    border: 1px solid #ddd;

                                    border-radius: 14px;

                                    padding: 14px;

                                    resize: none;
                                }


                                /* =========================================================
EMPTY
========================================================= */

                                .emptyActivities {

                                    color: #999;
                                }


                                /* =========================================================
MOBILE
========================================================= */

                                @media(max-width:768px) {

                                    .itinerary-day-row {

                                        flex-direction: column;
                                    }

                                    .itinerary-day-left {

                                        width: 100%;
                                    }

                                }
                            </style>

                            <br><br>


                            <style>
                                /* HOTEL FILTER BUTTONS */

                                .hotel-filter-btn {
                                    background: transparent !important;
                                    color: #555 !important;
                                    font-weight: 500;
                                    padding: 10px 18px;
                                    border-radius: 10px !important;
                                    transition: 0.3s ease;
                                    width: 100%;
                                    text-align: center;

                                    border: none !important;
                                    outline: none !important;
                                    box-shadow: none !important;
                                }


                                /* HOVER */

                                .hotel-filter-btn:hover {
                                    background: rgba(123, 97, 255, 0.08) !important;
                                    color: #7b61ff !important;

                                    border: none !important;
                                }


                                /* ACTIVE BUTTON */

                                .hotel-filter-btn.active {
                                    background: linear-gradient(135deg,
                                            #0077b6,
                                            #00b4d8) !important;

                                    color: #fff !important;

                                    border: none !important;
                                    outline: none !important;

                                    box-shadow:
                                        0 4px 14px rgba(123, 97, 255, 0.18) !important;
                                }


                                /* REMOVE ALL DEFAULT NAV BORDERS */

                                .nav-tabs {
                                    border: none !important;
                                }

                                .nav-tabs .nav-link {
                                    border: none !important;
                                }

                                .nav-tabs .nav-link.active {
                                    border: none !important;
                                }


                                .btn-primary {
                                    background: linear-gradient(135deg,
                                            #0077b6,
                                            #00b4d8) !important;
                                }



                                .selectedActivities {

                                    border: 1px solid #ddd;

                                    border-radius: 14px;

                                    padding: 12px;

                                    min-height: 65px;

                                    background: #fafafa;

                                    margin-bottom: 15px;
                                }

                                .selectedActivity {

                                    display: flex;

                                    justify-content: space-between;

                                    align-items: center;

                                    background: #fff;

                                    border: 1px solid #dbeafe;

                                    border-radius: 12px;

                                    padding: 10px 14px;

                                    margin-bottom: 10px;

                                    cursor: move;

                                    transition: 0.2s ease;
                                }

                                .selectedActivity:hover {

                                    border-color: #066168;

                                    box-shadow:
                                        0 5px 15px rgba(6, 97, 104, 0.08);
                                }

                                .selectedActivity span {

                                    display: flex;

                                    align-items: center;

                                    gap: 10px;

                                    font-weight: 600;
                                }

                                .selectedActivity button {

                                    border: none;

                                    background: none;

                                    color: red;
                                }


                                /* SORTABLE PLACEHOLDER */

                                .sortable-placeholder {

                                    height: 55px;

                                    border: 2px dashed #066168;

                                    border-radius: 12px;

                                    margin-bottom: 10px;

                                    background:
                                        rgba(6, 97, 104, 0.05);
                                }
                            </style>



                        </div>


                        <!-- =========================
SECTION : HOTELS
========================= -->

                        <div class="premium-section">

                            <div class="premium-icon pink">
                                <i class="fa-solid fa-hotel"></i>
                            </div>

                            <div>
                                <h3>Select Hotels</h3>
                                <p>Choose premium hotel stays</p>
                            </div>

                        </div>



                        <div id="hotel-list">
                            <?php include 'fetch_hotels.php'; ?>
                        </div>



                        <script>
                            function fetchHotels() {
                                const travelDate = document.getElementById("travelDate").value;
                                const selectedMonth = travelDate ? new Date(travelDate).getMonth() + 1 : new Date().getMonth() + 1;
                                const mealPlan = document.getElementById("mealPlan").value;

                                // Get all city values from all .city dropdowns
                                const cityElements = document.querySelectorAll(".city");
                                const cityIds = [];
                                cityElements.forEach(citySelect => {
                                    const val = citySelect.value;
                                    if (val) cityIds.push(val);
                                });

                                // Use state of the first row (or update logic if state differs per row)


                                // Construct URL with all cities
                                const queryString = new URLSearchParams();
                                queryString.append('month', selectedMonth);
                                queryString.append('id', '<?= !empty($_GET['id']) ? $_GET['id'] : "" ?>');
                                queryString.append('mealplan', mealPlan);

                                cityIds.forEach(id => queryString.append('city[]', id)); // <-- important for multiple cities

                                const url = `fetch_hotels.php?${queryString.toString()}`;

                                fetch(url)
                                    .then(response => response.text())
                                    .then(data => {
                                        document.getElementById('hotel-list').innerHTML = data;
                                    })
                                    .catch(err => console.error('Hotel fetch error:', err));
                            }

                            // Trigger fetch on changes
                            document.getElementById("travelDate").addEventListener("change", fetchHotels);
                            document.getElementById("mealPlan").addEventListener("change", fetchHotels);

                            // Add dynamic listeners for all state/city changes
                            document.addEventListener("change", function(e) {
                                if (e.target.matches(".state") || e.target.matches(".city")) {
                                    fetchHotels();
                                }
                            });

                            document.addEventListener("DOMContentLoaded", fetchHotels);
                        </script>
                        <!-- Submit button -->
                        <br><br>

                        <div class="text-center">
                            <button class="btn btn-primary" type="submit" name="submit"><?= !empty($isUpdatePage) && $isUpdatePage == true ? "Update Quotation" : "Generate Quotation"; ?> </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// PHP logic to process the form submission
error_reporting(E_ALL);
ini_set('display_errors', 1);

function getOrCreateActivity(
    $conn,
    $activityName,
    $cityId,
    $stateId
) {

    $activityName =
        mysqli_real_escape_string(
            $conn,
            trim($activityName)
        );

    // FIND EXISTING
    $query = mysqli_query(
        $conn,
        "
        SELECT id
        FROM activity
        WHERE
            LOWER(TRIM(name)) =
            LOWER('$activityName')
        AND city_id = '$cityId'
        AND state_id = '$stateId'
        LIMIT 1
    "
    );

    if (
        $query &&
        mysqli_num_rows($query) > 0
    ) {

        $row =
            mysqli_fetch_assoc($query);

        return $row['id'];
    }

    // CREATE NEW
    mysqli_query(
        $conn,
        "
        INSERT INTO activity
        (
            name,
            price,
            city_id,
            state_id,
            details,
            image,
            image2
        )
        VALUES
        (
            '$activityName',
            '0',
            '$cityId',
            '$stateId',
            '',
            '',
            ''
        )
    "
    );

    return mysqli_insert_id($conn);
}

if (isset($_POST['submit'])) {

    // echo "<pre>";
    // print_r($_POST);
    // echo "</pre>";  exit;

    $id = $_SESSION['id'] ?? 0;

    /* =====================================
       UPDATE MODE
    ===================================== */

    $quotationId = 0;

    if (!empty($isUpdatePage)) {

        $quotationId =
            (int)($_GET['id'] ?? 0);

        if (!$quotationId) {

            die("Invalid quotation ID");
        }
    }



    /* =====================================
       SANITIZE INPUTS
    ===================================== */

    $guestName      = $conn->real_escape_string($_POST['guestName'] ?? '');
    $travelDate     = $conn->real_escape_string($_POST['travelDate'] ?? '');
    $travelEndDate  = $conn->real_escape_string($_POST['travelEndDate'] ?? '');

    $travelMonth =
        !empty($travelDate)
        ? date('m', strtotime($travelDate))
        : null;

    $rooms          = isset($_POST['rooms']) ? (int)$_POST['rooms'] : 0;
    $pax            = isset($_POST['pax']) ? (int)$_POST['pax'] : 0;

    $mealPlan       =
        $conn->real_escape_string($_POST['mealPlan'] ?? '');

    $extraAdult     =
        isset($_POST['extraAdult'])
        ? (int)$_POST['extraAdult']
        : 0;

    $childBed =
        isset($_POST['childBed'])
        ? (int)$_POST['childBed']
        : 0;

    $markup =
        $conn->real_escape_string($_POST['markup'] ?? '');

    $totalMarkup =
        isset($_POST['totalMarkup'])
        ? (float)$_POST['totalMarkup']
        : 0;

    $vehicle =
        isset($_POST['vehicle'])
        ? (int)$_POST['vehicle']
        : 0;

    $vehicle_quantity = 0;

    if (
        !empty($_POST['vehicle_quantity']) &&
        is_array($_POST['vehicle_quantity'])
    ) {

        if (
            isset($_POST['vehicle_quantity'][$vehicle])
        ) {

            $vehicle_quantity =
                (int)$_POST['vehicle_quantity'][$vehicle];
        }
    }

    $seater =
        isset($_POST['seater'])
        ? (int)$_POST['seater']
        : 0;

    $pickup =
        isset($_POST['pickup'])
        ? (int)$_POST['pickup']
        : 0;

    $drop =
        isset($_POST['drop'])
        ? (int)$_POST['drop']
        : 0;

    $cities =
        $_POST['city'] ?? [];

    if (!is_array($cities)) {
        $cities = [$cities];
    }

    $nightsArray =
        $_POST['nights'] ?? [];

    if (!is_array($nightsArray)) {
        $nightsArray = [$nightsArray];
    }

    $nights =
        array_sum($nightsArray);

    $transfers =
        $_POST['transfer'] ?? [];

    if (!is_array($transfers)) {
        $transfers = [$transfers];
    }

    $hotels =
        $_POST['hotels'] ?? [];

    if (!is_array($hotels)) {
        $hotels = [$hotels];
    }

    //$conn->begin_transaction();

    try {

        /* =====================================
           UPDATE / INSERT QUOTATION
        ===================================== */

        if (!empty($isUpdatePage)) {

            $sql = "

                UPDATE quatation SET

                    guestName = ?,
                    travelDate = ?,
                    travelMonth = ?,
                    travelEndDate = ?,
                    nights = ?,
                    rooms = ?,
                    pax = ?,
                    mealPlan = ?,
                    extraAdult = ?,
                    childBed = ?,
                    markup = ?,
                    totalMarkup = ?,
                    vehicle_id = ?,
                    vehicleQuantity = ?,
                    pickup_id = ?,
                    drop_id = ?,
                    seater_id = ?

                WHERE id = ?

            ";

            $stmt = $conn->prepare($sql);

            $stmt->bind_param(
                'ssssisssissdiiiiii',
                $guestName,
                $travelDate,
                $travelMonth,
                $travelEndDate,
                $nights,
                $rooms,
                $pax,
                $mealPlan,
                $extraAdult,
                $childBed,
                $markup,
                $totalMarkup,
                $vehicle,
                $vehicle_quantity,
                $pickup,
                $drop,
                $seater,
                $quotationId
            );

            $stmt->execute();

            $stmt->close();




            /* =====================================
               DELETE OLD DATA
            ===================================== */
            $tables = [

                'quatation_activities',
                'quatation_transfers',
                'quatation_hotels',
                'quatation_cities'

            ];

            foreach ($tables as $table) {

                $stmt = $conn->prepare(
                    "DELETE FROM $table
         WHERE quotation_id = ?"
                );

                $stmt->bind_param(
                    "i",
                    $quotationId
                );

                if (!$stmt->execute()) {

                    die($table . ' : ' .
                        $stmt->error);
                }

                $stmt->close();
            }
        } else {

            /* =====================================
               INSERT QUOTATION
            ===================================== */

            $sql = "

                INSERT INTO quatation
                (
                    guestName,
                    travelDate,
                    travelMonth,
                    travelEndDate,
                    nights,
                    rooms,
                    pax,
                    mealPlan,
                    extraAdult,
                    childBed,
                    markup,
                    totalMarkup,
                    vehicle_id,
                    vehicleQuantity,
                    pickup_id,
                    drop_id,
                    seater_id,
                    register_id,
                    created_at
                )

                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
                )

            ";

            $stmt = $conn->prepare($sql);

            $stmt->bind_param(
                'ssssisssissdiiiiii',
                $guestName,
                $travelDate,
                $travelMonth,
                $travelEndDate,
                $nights,
                $rooms,
                $pax,
                $mealPlan,
                $extraAdult,
                $childBed,
                $markup,
                $totalMarkup,
                $vehicle,
                $vehicle_quantity,
                $pickup,
                $drop,
                $seater,
                $id
            );

            $stmt->execute();

            $quotationId =
                $conn->insert_id;

            $stmt->close();
        }

        /* =====================================
           SAVE CITIES
        ===================================== */

        if (!empty($cities)) {

            $cityStmt = $conn->prepare("

                INSERT INTO quatation_cities
                (
                    quotation_id,
                    city_id,
                    state_id,
                    nights,
                    register_id
                )

                VALUES (?, ?, ?, ?, ?)

            ");

            foreach ($cities as $index => $city) {

                $city = (int)$city;

                $nightsForCity =
                    isset($nightsArray[$index])
                    ? (int)$nightsArray[$index]
                    : 0;

                $cityStmt->bind_param(
                    'iiiii',
                    $quotationId,
                    $city,
                    $state_id,
                    $nightsForCity,
                    $id
                );

                $cityStmt->execute();
            }

            $cityStmt->close();
        }

        /* =====================================
           MEAL PLAN ID
        ===================================== */

        $mealPlanId = $mealPlan;

        $mealPlanQuery = $conn->prepare("
            SELECT id
            FROM plan
            WHERE mealplan = ?
        ");

        $mealPlanQuery->bind_param(
            's',
            $mealPlan
        );

        $mealPlanQuery->execute();

        $mealPlanResult =
            $mealPlanQuery->get_result();

        if (
            $mealPlanRow =
            $mealPlanResult->fetch_assoc()
        ) {

            $mealPlanId =
                $mealPlanRow['id'];
        }

        $mealPlanQuery->close();

        /* =====================================
           SAVE HOTELS
        ===================================== */

        if (
            !empty($hotels) &&
            $mealPlanId !== null
        ) {

            $hotelStmt = $conn->prepare("

                INSERT INTO quatation_hotels
                (
                    quotation_id,
                    hotel_id,
                    travelMonth,
                    city_id,
                    state_id,
                    mealPlan,
                    rooms,
                    extraAdult,
                    extrabedprice,
                    totalextrabedprice,
                    childBed,
                    childbedprice,
                    totalchildbedprice,
                    nights,
                    vehicle_id,
                    register_id,
                    total_price
                )

                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )

            ");

            foreach ($hotels as $hotelId) {

                $hotelQuery = $conn->prepare("
                    SELECT city_id
                    FROM hotel
                    WHERE id = ?
                ");

                $hotelQuery->bind_param(
                    'i',
                    $hotelId
                );

                $hotelQuery->execute();

                $hotelResult =
                    $hotelQuery->get_result();

                if (
                    $hotelRow =
                    $hotelResult->fetch_assoc()
                ) {

                    $cityId =
                        $hotelRow['city_id'];

                    $index =
                        array_search(
                            $cityId,
                            $cities
                        );

                    $nightsForHotel =
                        ($index !== false)
                        ? (int)$nightsArray[$index]
                        : 0;

                    $priceQuery = $conn->prepare("

                        SELECT
                            hp.price,
                            hebp.extrabedprice,
                            hcbp.childbedprice

                        FROM hotel_prices hp

                        LEFT JOIN hotel_extra_bed_price hebp
                            ON hp.hotel_id = hebp.hotel_id
                            AND hp.mealplan_id = hebp.mealplan_id

                        LEFT JOIN hotel_child_bed_price hcbp
                            ON hp.hotel_id = hcbp.hotel_id
                            AND hp.mealplan_id = hcbp.mealplan_id

                        WHERE hp.hotel_id = ?
                        AND hp.month = ?
                        AND hp.mealplan_id = ?

                    ");

                    $priceQuery->bind_param(
                        'isi',
                        $hotelId,
                        $travelMonth,
                        $mealPlanId
                    );

                    $priceQuery->execute();

                    $priceResult =
                        $priceQuery->get_result();

                    if (
                        $priceRow =
                        $priceResult->fetch_assoc()
                    ) {

                        $price =
                            (float)$priceRow['price'];

                        $extrabedprice =
                            (float)$priceRow['extrabedprice'];

                        $childbedprice =
                            (float)$priceRow['childbedprice'];

                        $totalPrice =
                            $price *
                            $rooms *
                            $nightsForHotel;

                        $totalExtraBedPrice =
                            $extrabedprice *
                            $extraAdult *
                            $nightsForHotel;

                        $totalChildBedPrice =
                            $childbedprice *
                            $childBed *
                            $nightsForHotel;

                        $hotelStmt->bind_param(
                            'iisiiiiiddidididi',
                            $quotationId,
                            $hotelId,
                            $travelMonth,
                            $cityId,
                            $state_id,
                            $mealPlanId,
                            $rooms,
                            $extraAdult,
                            $extrabedprice,
                            $totalExtraBedPrice,
                            $childBed,
                            $childbedprice,
                            $totalChildBedPrice,
                            $nightsForHotel,
                            $vehicle,
                            $id,
                            $totalPrice
                        );

                        $hotelStmt->execute();
                    }

                    $priceQuery->close();
                }

                $hotelQuery->close();
            }

            $hotelStmt->close();
        }

        $sortOrder = 1;
        /* =====================================
           SAVE ITINERARY
        ===================================== */


        if (!empty($_POST['itinerary'])) {



            /* =====================================
PREPARE ALL ITINERARY DAYS
===================================== */

            $itineraryData = [];

            $originalIndex = 0;

            foreach ($_POST['itinerary'] as $dayData) {

                $dayData['_original_index'] =
                    $originalIndex++;

                $itineraryData[] = $dayData;
            }

            /* =====================================
SORT BY DATE
THEN KEEP ORIGINAL ORDER
===================================== */

            usort(
                $itineraryData,
                function ($a, $b) {

                    $dateCompare =
                        strtotime($a['activity_date'])
                        <=>
                        strtotime($b['activity_date']);

                    // SAME DATE
                    if ($dateCompare === 0) {

                        return
                            $a['_original_index']
                            <=>
                            $b['_original_index'];
                    }

                    return $dateCompare;
                }
            );
            $sortOrder = 0;
            foreach ($itineraryData as $dayData) {

                $day_number =
                    intval($dayData['day_number']);

                $city_id =
                    intval($dayData['city_id']);

                $activity_date =
                    mysqli_real_escape_string(
                        $conn,
                        $dayData['activity_date']
                    );

                $notes =
                    mysqli_real_escape_string(
                        $conn,
                        $dayData['notes'] ?? ''
                    );

                // GET STATE ID FROM CITY
                $stateQuery = mysqli_query(
                    $conn,
                    "
            SELECT state_id
            FROM city
            WHERE id = '$city_id'
            LIMIT 1
        "
                );

                $stateRow =
                    mysqli_fetch_assoc($stateQuery);

                $state_id =
                    $stateRow['state_id'];



                /* =========================================
           ARRIVAL
        ========================================= */

                if (
                    isset($dayData['arrival_activity'])
                ) {

                    $arrivalActivityId =
                        !empty($dayData['arrival_activity'])
                        ? intval($dayData['arrival_activity'])
                        : 0;

                    // CREATE IF NOT FOUND
                    if (empty($arrivalActivityId)) {

                        $arrivalActivityId =
                            getOrCreateActivity(
                                $conn,
                                ACTIVITY_ARRIVAL,
                                $city_id,
                                $state_id
                            );
                    }

                    mysqli_query(
                        $conn,
                        "
                INSERT INTO quatation_activities
                (
                    quotation_id,
                    day_number,
                    city_id,
                    activity_id,
                    activity_date,
                    notes,
                    sort_order,
                    state_id,
                    vehicle_id,
                    register_id
                )
                VALUES
                (
                    '$quotationId',
                    '$day_number',
                    '$city_id',
                    '$arrivalActivityId',
                    '$activity_date',
                    '$notes',
                    '$sortOrder',
                    '$state_id',
                    '$vehicle',
                    '$id'
                )
            "
                    );

                    $sortOrder++;
                }

                /* =========================================
           NORMAL ACTIVITIES
        ========================================= */

                // if (!empty($dayData['activities'])) {

                //     foreach (
                //         $dayData['activities']
                //         as $activityId
                //     ) {

                //         $activityId =
                //             intval($activityId);

                //         if (empty($activityId)) {
                //             continue;
                //         }

                //         mysqli_query(
                //             $conn,
                //             "
                //     INSERT INTO quatation_activities
                //     (
                //         quotation_id,
                //         day_number,
                //         city_id,
                //         activity_id,
                //         activity_date,
                //         notes,
                //         sort_order,
                //           state_id,
                //     vehicle_id,
                //     register_id
                //     )
                //     VALUES
                //     (
                //         '$quotationId',
                //         '$day_number',
                //         '$city_id',
                //         '$activityId',
                //         '$activity_date',
                //         '$notes',
                //         '$sortOrder', 
                //         '$state_id',
                //         '$vehicle',
                //         '$id'
                //     )
                // "
                //         );

                //         $sortOrder++;
                //     }
                // }

                //var_dump(! isset($dayData['arrival_activity']),  !isset($dayData['departure_activity']) , !empty($dayData['activities'])); exit;

                if (!empty($dayData['activities'])) {


                    foreach ($dayData['activities'] as $activityId) {

                        $activityId = intval($activityId);

                        if (empty($activityId)) {
                            continue;
                        }

                        mysqli_query(
                            $conn,
                            "
            INSERT INTO quatation_activities
            (
                quotation_id,
                day_number,
                city_id,
                activity_id,
                activity_date,
                notes,
                sort_order,
                state_id,
                vehicle_id,
                register_id
            )
            VALUES
            (
                '$quotationId',
                '$day_number',
                '$city_id',
                '$activityId',
                '$activity_date',
                '$notes',
                '$sortOrder',
                '$state_id',
                '$vehicle',
                '$id'
            )
            "
                        );

                        $sortOrder++;
                    }
                } else if (! isset($dayData['arrival_activity']) &&  !isset($dayData['departure_activity'])) {

                    // Leisure activity insert
                    mysqli_query(
                        $conn,
                        "
        INSERT INTO quatation_activities
        (
            quotation_id,
            day_number,
            city_id,
            activity_id,
            activity_date,
            notes,
            sort_order,
            state_id,
            vehicle_id,
            register_id
        )
        VALUES
        (
            '$quotationId',
            '$day_number',
            '$city_id',
            '0',
            '$activity_date',
            '$notes',
            '$sortOrder',
            '$state_id',
            '$vehicle',
            '$id'
        )
        "
                    );

                    $sortOrder++;
                }


                /* =========================================
           DEPARTURE
        ========================================= */

                if (
                    isset($dayData['departure_activity'])
                ) {

                    $departureActivityId =
                        !empty($dayData['departure_activity'])
                        ? intval($dayData['departure_activity'])
                        : 0;

                    // CREATE IF NOT FOUND
                    if (empty($departureActivityId)) {

                        $departureActivityId =
                            getOrCreateActivity(
                                $conn,
                                ACTIVITY_DEPARTURE,
                                $city_id,
                                $state_id
                            );
                    }

                    mysqli_query(
                        $conn,
                        "
                INSERT INTO quatation_activities
                (
                    quotation_id,
                    day_number,
                    city_id,
                    activity_id,
                    activity_date,
                    notes,
                    sort_order , state_id,
                    vehicle_id,
                    register_id
                )
                VALUES
                (
                    '$quotationId',
                    '$day_number',
                    '$city_id',
                    '$departureActivityId',
                    '$activity_date',
                    '$notes',
                    '$sortOrder',
                    '$state_id',
                        '$vehicle',
                        '$id'
                )
            "
                    );

                    $sortOrder++;
                }
            }
        }
        /* =====================================
           SAVE TRANSFERS
        ===================================== */

        if (!empty($_POST['transfers'])) {

            $transferStmt = $conn->prepare("

                INSERT INTO quatation_transfers
                (
                    quotation_id,
                    transfer_id,
                    city_id,
                    state_id,
                    vehicle_id,
                    seater,
                    pickup_id,
                    drop_id,
                    register_id
                )

                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                )

            ");

            $totalCities =
                count($cities);

            foreach ($_POST['transfers'] as $value) {

                list(
                    $transferId,
                    $cityId
                ) = explode('|', $value);

                $transferId =
                    (int)$transferId;

                $cityId =
                    (int)$cityId;

                if ($totalCities > 1) {

                    $priceTable =
                        "transfer_vehicle_price";
                } else {

                    $priceTable =
                        "transfer_single_city_price";
                }

                $query = $conn->prepare("

                    SELECT
                        state_id,
                        pickup_id,
                        drop_id

                    FROM $priceTable

                    WHERE transfer_id = ?
                    AND city_id = ?

                    LIMIT 1

                ");

                $query->bind_param(
                    "ii",
                    $transferId,
                    $cityId
                );

                $query->execute();

                $res =
                    $query->get_result();

                if ($row = $res->fetch_assoc()) {

                    $stateId =
                        $row['state_id'];

                    $pickup_id =
                        $row['pickup_id'];

                    $drop_id =
                        $row['drop_id'];

                    $transferStmt->bind_param(
                        'iiiiiiiii',
                        $quotationId,
                        $transferId,
                        $cityId,
                        $stateId,
                        $vehicle,
                        $seater,
                        $pickup_id,
                        $drop_id,
                        $id
                    );

                    $transferStmt->execute();
                }

                $query->close();
            }

            $transferStmt->close();
        }

        /* =====================================
           COMMIT
        ===================================== */

        //   $conn->commit();

        $_SESSION['quotation_id'] =
            $quotationId;

        if (!empty($isUpdatePage)) {

            echo "Quotation Updated Successfully";
        } else {

            echo "Quotation Added Successfully";
        }

        echo "
        <script>
            window.location.href =
                'quatation.php';
        </script>
        ";
    } catch (Exception $e) {

        $conn->rollback();

        die('Transaction failed: ' .
            $e->getMessage());
    } finally {

        $conn->close();
    }
}
?>






<script>
    /* =========================================================
FULL FORM VALIDATION
ACCORDING TO YOUR ACTUAL HTML IDS & CLASSES
========================================================= */

    $(document).ready(function() {


        /* =====================================================
        REMOVE ERROR ON INPUT CHANGE
        ===================================================== */

        $(document).on(
            "keyup change",
            ".form-control, .form-select",
            function() {

                removeError($(this));
            }
        );



        /* =====================================================
        REMOVE VEHICLE ERROR
        ===================================================== */

        $(document).on(
            "change",
            ".vehicle-option",
            function() {

                $(".transfer-dropdown")
                    .removeClass("error");

                $(".transfer-dropdown")
                    .find(".invalid-feedback")
                    .remove();
            }
        );



        /* =====================================================
        REMOVE HOTEL ERROR
        ===================================================== */

        $(document).on(
            "change",
            "input[name='hotels[]']",
            function() {

                $(".hotel-error").remove();
            }
        );



        /* =====================================================
        FORM SUBMIT
        ===================================================== */

        $("#myForm").on("submit", function(e) {

            let valid = true;


            /* =================================================
            CLEAR OLD ERRORS
            ================================================= */

            $(".is-invalid").removeClass("is-invalid");

            $(".has-error").removeClass("has-error");

            $(".invalid-feedback").remove();



            /* =================================================
            GUEST NAME
            ================================================= */

            const guestName =
                $("#guestName");

            if (
                guestName.length &&
                $.trim(guestName.val()) == ""
            ) {

                showError(
                    guestName,
                    "Guest name is required"
                );

                valid = false;
            }



            /* =================================================
            TRAVEL START DATE
            ================================================= */

            const travelDate =
                $("#travelDate");

            if (
                travelDate.length &&
                travelDate.val() == ""
            ) {

                showError(
                    travelDate,
                    "Select travel start date"
                );

                valid = false;
            }



            /* =================================================
            TRAVEL END DATE
            ================================================= */

            const travelEndDate =
                $("#travelEndDate");

            if (
                travelEndDate.length &&
                travelEndDate.val() == ""
            ) {

                showError(
                    travelEndDate,
                    "Select travel end date"
                );

                valid = false;
            }



            /* =================================================
            TOTAL NIGHTS
            ================================================= */

            const totalNights =
                $("#nights");

            if (
                totalNights.length &&
                (
                    totalNights.val() == "" ||
                    parseInt(totalNights.val()) <= 0
                )
            ) {

                showError(
                    totalNights,
                    "Enter total nights"
                );

                valid = false;
            }



            /* =================================================
            CITY VALIDATION
            ================================================= */

            let citySelected = false;

            $(".city").each(function() {

                if (
                    $(this).val() &&
                    $.trim($(this).val()) != ""
                ) {

                    citySelected = true;
                }
            });


            if (!citySelected) {

                showError(
                    $(".city").first(),
                    "Select at least one city"
                );

                valid = false;
            }



            /* =================================================
            CITY NIGHTS
            ================================================= */

            $(".destination-row").each(function() {

                let city =
                    $(this).find(".city");

                let cityNight =
                    $(this).find("input[name='nights[]']");

                if (
                    city.length &&
                    city.val() &&
                    $.trim(city.val()) != ""
                ) {

                    if (
                        cityNight.length &&
                        (
                            cityNight.val() == "" ||
                            parseInt(cityNight.val()) <= 0
                        )
                    ) {

                        showError(
                            cityNight,
                            "Enter nights"
                        );

                        valid = false;
                    }
                }
            });



            /* =================================================
            ROOMS
            ================================================= */

            const rooms =
                $("#rooms");

            if (
                rooms.length &&
                (
                    rooms.val() == "" ||
                    parseInt(rooms.val()) <= 0
                )
            ) {

                showError(
                    rooms,
                    "Select rooms"
                );

                valid = false;
            }



            /* =================================================
            PAX
            ================================================= */

            const pax =
                $("#pax");

            if (
                pax.length &&
                (
                    pax.val() == "" ||
                    parseInt(pax.val()) <= 0
                )
            ) {

                showError(
                    pax,
                    "Select total persons"
                );

                valid = false;
            }



            /* =================================================
            VEHICLE
            ================================================= */

            let vehicleSelected =
                $(".vehicle-option:checked").length > 0;


            if (!vehicleSelected) {

                $(".transfer-dropdown")
                    .addClass("error");

                if (
                    $(".transfer-dropdown")
                    .find(".invalid-feedback")
                    .length == 0
                ) {

                    $(".transfer-dropdown").append(

                        '<div class="invalid-feedback">' +
                        'Select vehicle' +
                        '</div>'
                    );
                }

                valid = false;
            }



            // /* =================================================
            // PICKUP
            // ================================================= */

            // if(vehicleSelected){

            //     const pickup =
            //         $("#pickup");

            //     if(
            //         pickup.length &&
            //         (
            //             pickup.val() == "" ||
            //             pickup.val() == null
            //         )
            //     ){

            //         showError(
            //             pickup,
            //             "Select pickup location"
            //         );

            //         valid = false;
            //     }
            // }



            // /* =================================================
            // DROP
            // ================================================= */

            // if(vehicleSelected){

            //     const drop =
            //         $("#drop");

            //     if(
            //         drop.length &&
            //         (
            //             drop.val() == "" ||
            //             drop.val() == null
            //         )
            //     ){

            //         showError(
            //             drop,
            //             "Select drop location"
            //         );

            //         valid = false;
            //     }
            // }


            /* =================================================
            PICKUP REQUIRED
            ================================================= */

            // if(vehicleSelected){

            //     const pickup =
            //         $("#pickupList");

            //     if(
            //         pickup.length &&
            //         (
            //             pickup.val() == "" ||
            //             pickup.val() == null
            //         )
            //     ){

            //         pickup.addClass("is-invalid");

            //         pickup
            //             .closest(".w-full md:w-1/2 xl:w-[32%], .w-full md:w-1/3 xl:w-[32%], .mb-3")
            //             .addClass("has-error");

            //         pickup
            //             .next(".invalid-feedback")
            //             .remove();

            //         pickup.parent().append(

            //             '<div class="invalid-feedback d-block">'+
            //             'Select pickup city'+
            //             '</div>'
            //         );

            //         valid = false;
            //     }
            // }



            /* =================================================
            DROP REQUIRED
            ================================================= */

            // if(vehicleSelected){

            //     const drop =
            //         $("#dropList");

            //     if(
            //         drop.length &&
            //         (
            //             drop.val() == "" ||
            //             drop.val() == null
            //         )
            //     ){

            //         drop.addClass("is-invalid");

            //         drop
            //             .closest(".w-full md:w-1/2 xl:w-[32%], .w-full md:w-1/3 xl:w-[32%], .mb-3")
            //             .addClass("has-error");

            //         drop
            //             .next(".invalid-feedback")
            //             .remove();

            //         drop.parent().append(

            //             '<div class="invalid-feedback d-block">'+
            //             'Select drop city'+
            //             '</div>'
            //         );

            //         valid = false;
            //     }
            // }


            /* =================================================
            HOTEL VALIDATION
            ================================================= */

            if (
                $("input[name='hotels[]']:checked")
                .length == 0
            ) {

                if (
                    $(".hotel-error").length == 0
                ) {

                    $("#hotels-container").append(

                        '<div class="invalid-feedback hotel-error d-block mt-3">' +
                        'Select at least one hotel' +
                        '</div>'
                    );
                }

                valid = false;
            }



            /* =================================================
            SCROLL TO FIRST ERROR
            ================================================= */

            if (!valid) {

                e.preventDefault();

                let firstError =
                    $(".is-invalid").first();

                if (!firstError.length) {

                    firstError =
                        $(".invalid-feedback").first();
                }

                if (firstError.length) {

                    $("html, body").animate({

                        scrollTop: firstError.offset().top - 140

                    }, 500);
                }

                return false;
            }

        });





        /* =====================================================
        SHOW ERROR
        ===================================================== */

        function showError(input, message) {

            if (!input.length) {

                return;
            }

            input
                .addClass("is-invalid");

            input
                .closest(".mb-3, .w-full md:w-1/3 xl:w-[32%], .w-full md:w-1/2 xl:w-[32%], .w-full md:w-1/3 xl:w-[32%]")
                .addClass("has-error");

            input
                .siblings(".invalid-feedback")
                .remove();

            input.after(

                '<div class="invalid-feedback">' +
                message +
                '</div>'
            );
        }




        /* =====================================================
        REMOVE ERROR
        ===================================================== */

        function removeError(input) {

            input
                .removeClass("is-invalid");

            input
                .closest(".mb-3, .w-full md:w-1/3 xl:w-[32%], .w-full md:w-1/2 xl:w-[32%], .w-full md:w-1/3 xl:w-[32%]")
                .removeClass("has-error");

            input
                .siblings(".invalid-feedback")
                .remove();
        }





    });
</script>





<script>
    /* =========================================================
AUTO SELECT SEATER VALUE
========================================================= */

    function setSelectedSeater() {

        const checkedSeater =
            $(".seater-option:checked");

        if (checkedSeater.length) {

            const seaterText =
                checkedSeater
                .next("label")
                .text()
                .trim();

            $("#seaterDropdown")
                .text(seaterText);

            $("#seater-wrapper")
                .show();
        }
    }



    /* =========================================================
    SEATER CLICK
    ========================================================= */

    $(document).on(
        "click",
        ".seater-option + label",
        function(e) {

            e.preventDefault();

            e.stopPropagation();

            const radio =
                $(this)
                .prev(".seater-option");

            radio.prop("checked", true);

            radio.trigger("change");
        }
    );



    /* =========================================================
    SEATER CHANGE
    ========================================================= */

    $(document).on(
        "change",
        ".seater-option",
        function() {

            const seaterText =
                $(this)
                .next("label")
                .text()
                .trim();

            $("#seaterDropdown")
                .text(seaterText);
        }
    );



    /* =========================================================
    AFTER AJAX LOAD
    ========================================================= */

    function loadSeaters(vehicleId) {

        $.post(
            "get_seaters.php", {
                vehicle_id: vehicleId
            },
            function(data) {

                $("#seaterList")
                    .html(data);

                $("#seater-wrapper")
                    .show();

                // WAIT FOR HTML RENDER
                setTimeout(function() {

                    setSelectedSeater();

                }, 300);
            }
        );
    }



    /* =========================================================
    INITIAL PAGE LOAD
    ========================================================= */

    $(document).ready(function() {

        setTimeout(function() {

            setSelectedSeater();

        }, 500);
    });
</script>
<script>
    $(document).on("click", ".vehicle-item", function(e) {

        // Ignore quantity buttons/input
        if (
            $(e.target).closest(
                ".qty-increase, .qty-decrease, .vehicle-qty-input"
            ).length
        ) {
            return;
        }

        const radio =
            $(this).find(".vehicle-option");

        // Already selected
        if (radio.prop("checked")) {
            return;
        }

        // Select
        radio.prop("checked", true);

        // Trigger existing logic
        radio.trigger("change");
    });
</script>


<script>
    $(document).ready(function() {

        /* =====================================
           PHP VALUES
        ===================================== */

        let selectedVehicle = <?= (int)$selectedVehicle ?>;
        let selectedPickup = <?= (int)$selectedPickupId ?>;
        let selectedDrop = <?= (int)$selectedDropId ?>;
        let selectedSeater = <?= isset($selectedSeater) ? (int)$selectedSeater : 0 ?>;
        let selectedQuantity = <?= (int)$selectedQuantity ?>;



        /* =====================================
           VEHICLE AUTO SELECT
        ===================================== */

        if (selectedVehicle > 0) {

            let vehicleRadio =
                $("#vehicle_" + selectedVehicle);

            if (vehicleRadio.length) {

                vehicleRadio.prop("checked", true);

                // dropdown text
                let vehicleName =
                    vehicleRadio
                    .closest(".vehicle-item")
                    .find("label")
                    .text()
                    .trim();

                $("#vehicleDropdown")
                    .text(vehicleName);

                // quantity show
                let qtyBox =
                    vehicleRadio
                    .closest(".vehicle-item")
                    .find(".vehicle-quantity");

                qtyBox.css("display", "flex");

                // quantity value
                $("#vehicleQty_" + selectedVehicle)
                    .val(selectedQuantity);
            }
        }



        /* =====================================
           PICKUP AUTO SELECT
        ===================================== */

        if (selectedPickup > 0) {

            let pickupRadio =
                $("#pickup_" + selectedPickup);

            if (pickupRadio.length) {

                pickupRadio.prop("checked", true);

                let pickupName =
                    pickupRadio
                    .closest(".form-check")
                    .find("label")
                    .text()
                    .trim();

                $("#pickupDropdown")
                    .text(pickupName);
            }
        }



        /* =====================================
           DROP AUTO SELECT
        ===================================== */

        if (selectedDrop > 0) {

            let dropRadio =
                $("#drop_" + selectedDrop);

            if (dropRadio.length) {

                dropRadio.prop("checked", true);

                let dropName =
                    dropRadio
                    .closest(".form-check")
                    .find("label")
                    .text()
                    .trim();

                $("#dropDropdown")
                    .text(dropName);
            }
        }



        /* =====================================
           SEATER AUTO SELECT
        ===================================== */

        function autoSelectSeater() {

            if (selectedSeater > 0) {

                let seaterRadio =
                    $("#seater_" + selectedSeater);

                if (seaterRadio.length) {

                    seaterRadio.prop("checked", true);

                    let seaterName =
                        seaterRadio
                        .closest(".form-check")
                        .find("label")
                        .text()
                        .trim();

                    $("#seaterDropdown")
                        .text(seaterName);
                }
            }
        }



        /* =====================================
           WAIT FOR AJAX SEATER LOAD
        ===================================== */

        setTimeout(function() {

            autoSelectSeater();

        }, 800);



        /* =====================================
           CLICK LABEL SUPPORT
        ===================================== */

        $(document).on(
            "click",
            ".pickup-option + label",
            function(e) {

                e.preventDefault();

                let radio =
                    $(this).prev(".pickup-option");

                radio.prop("checked", true);

                $("#pickupDropdown")
                    .text($(this).text().trim());
            }
        );



        $(document).on(
            "click",
            ".drop-option + label",
            function(e) {

                e.preventDefault();

                let radio =
                    $(this).prev(".drop-option");

                radio.prop("checked", true);

                $("#dropDropdown")
                    .text($(this).text().trim());
            }
        );



        $(document).on(
            "click",
            ".seater-option + label",
            function(e) {

                e.preventDefault();

                let radio =
                    $(this).prev(".seater-option");

                radio.prop("checked", true);

                $("#seaterDropdown")
                    .text($(this).text().trim());
            }
        );

    });
</script>
<script>
    $(document).ready(function() {

        const dropdownBtn = $('#transferDropdown');

        function updateDropdownText() {

            let selected = [];

            $('.transfer-option:checked').each(function() {

                let label = $(this)
                    .closest('.form-check')
                    .find('.form-check-label')
                    .text()
                    .trim();

                selected.push(label);
            });

            dropdownBtn.text(
                selected.length ? selected.join(', ') : 'Select Transfers'
            );
        }

        function updateActiveState() {

            $('.list-group-item').each(function() {

                let checkbox = $(this).find('.transfer-option');

                if (checkbox.is(':checked')) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }

            });
        }

        // checkbox change
        $(document).on('change', '.transfer-option', function() {

            const transferId = $(this).val();
            const cityIds = $(this).data('cities').toString().split(',');

            // remove old hidden inputs first
            $(`.generated-transfer[data-transfer="${transferId}"]`).remove();

            // if checked add again
            if ($(this).is(':checked')) {

                cityIds.forEach(function(cityId) {

                    $('.fetch_trans_container').append(`
                    <input
                        type="hidden"
                        name="transfers[]"
                        value="${transferId}|${cityId}"
                        class="generated-transfer"
                        data-transfer="${transferId}"
                    >
                `);

                });

            }

            updateActiveState();
            updateDropdownText();

        });

        // click anywhere on card
        $(document).on('click', '.list-group-item', function(e) {

            let checkbox = $(this).find('.transfer-option');

            if ($(e.target).hasClass('transfer-option')) return;

            checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');

        });

    });
</script>



<?php
include 'footer.php';
?>







































































































































































quatation.php
<?php

$state  = '';
$title = "Quotation Details";
$pickDropDetails = [];
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
?>

<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}



// Redirect to login if not logged in
if (!isset($_SESSION['logged_in'])) {
    header('Location: login.php');
    exit;
}

if (!isset($_SESSION['quotation_id'])) {
    echo "Quotation ID not set.";
    exit;
}

include 'header.php';
$id = mysqli_real_escape_string($conn, $_SESSION['quotation_id']);



function maskNumber($number)
{
    $number = (string)$number;

    if (strlen($number) <= 1) {
        return $number;
    }

    return $number[0] . str_repeat('x', strlen($number) - 1);
}


// $Price =0;
// $totalextraAdult = 0;
// $totalChildBed = 0;
// $totalPeople = 0;
$totalcabprice = 0;
$transferperperson2 = 0;
$cityCount = 0;
// Get main quotation details
$sql = "SELECT * FROM quatation WHERE id = '$id'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) === 0) {
    echo "Quotation not found.";
    exit;
}

$row = mysqli_fetch_assoc($result);
$user_name = $row['guestName'];


$travelDate = $row['travelDate'];
$travelEndDate = $row['travelEndDate'];
$travelMonth = date('n', strtotime($travelDate));
$nights = $row['nights'];
$rooms = $row['rooms'];
$pax = $row['pax'];
$markup = $row['markup'];
$vehicleQuantity = $row['vehicleQuantity'];
$vehicle = $row['vehicle_id'];
$totalmarkup = $row['totalMarkup'];
$extraAdult = (int)$row['extraAdult'];
$userId = $row['register_id'];
$childBed = (int)$row['childBed'];

$mealPlan = $row['mealPlan'];  // Meal plan ID from quatation table

// Initialize variables
$extraBedPrice = 0;
// Get meal plan name
$mealsql = "SELECT p.mealPlan FROM quatation q 
                        JOIN plan p ON q.mealPlan = p.id WHERE q.id = '$id'";
$mealresult = mysqli_query($conn, $mealsql);
$mealData = mysqli_fetch_assoc($mealresult);
$mealPlanName = $mealData['mealPlan'];

// Show cities


$citiesInOrder = []; // To store city ids in order
$sqlCities = "
    SELECT qc.city_id, c.city_name, qc.nights
    FROM quatation_cities qc
    JOIN city c ON qc.city_id = c.id
    WHERE qc.quotation_id = '$id'
    ORDER BY qc.id ASC
";

$resultCities = mysqli_query($conn, $sqlCities);

// Check if there are any results
if (mysqli_num_rows($resultCities) > 0) {


    // Fetch and display cities
    while ($city = mysqli_fetch_assoc($resultCities)) {

        $citiesInOrder[] = [
            'id' => $city['city_id'],
            'name' => $city['city_name']
        ];
    }
    $cityCount = count($citiesInOrder);
} else {
}

echo "<br>";
$sqlhotels = "
    SELECT
        c.id AS city_id,
        c.city_name, 
        s.state_name,
        h.id AS hotel_id, 
        h.name AS hotel_name,
        hp.price AS hotel_price_per_nights,
        hebp.extrabedprice,
        hcbp.childbedprice,
        h.hotel_front_image,
        h.bedroom_image,
        qh.mealPlan AS meal_plan,
        qc.nights AS city_nights, 
        qh.total_price AS total_price,
        qh.totalextrabedprice AS total_extra_bed_price,
        qh.totalchildbedprice AS total_child_bed_price
    FROM quatation_hotels qh
    JOIN hotel h ON qh.hotel_id = h.id
    JOIN hotel_prices hp 
        ON h.id = hp.hotel_id 
        AND hp.mealplan_id = qh.mealPlan 
        AND hp.month = '$travelMonth'
    JOIN city c ON qh.city_id = c.id
    LEFT JOIN hotel_extra_bed_price hebp 
        ON qh.hotel_id = hebp.hotel_id 
        AND hebp.mealplan_id = qh.mealPlan
    LEFT JOIN hotel_child_bed_price hcbp 
        ON qh.hotel_id = hcbp.hotel_id 
        AND hcbp.mealplan_id = qh.mealPlan
    JOIN state s ON c.state_id = s.id
    JOIN quatation q ON qh.quotation_id = q.id
    JOIN plan p ON p.id = qh.mealPlan
   JOIN (
    SELECT
        quotation_id,
        city_id,
        MAX(id) AS city_row_id,
        MAX(nights) AS nights
    FROM quatation_cities
    GROUP BY quotation_id, city_id
) qc
    ON qc.quotation_id = qh.quotation_id
    AND qc.city_id = qh.city_id
    WHERE q.id = '$id' AND qh.mealPlan = '$mealPlan'
";

$resultHotels = mysqli_query($conn, $sqlhotels);


if (!$resultHotels) {
    die("SQL Error: " . mysqli_error($conn));
}

if (mysqli_num_rows($resultHotels) > 0) {

    $cityHotels = [];
    while ($hotel = mysqli_fetch_assoc($resultHotels)) {
        $cityHotels[$hotel['city_id']][] = $hotel;
    }




    $cityActivityCount = []; // To track the number of activities per city

    // Fetch and group activities by city_id
    $sqlActivitiesDetails = "SELECT 
    a.id,
    a.name, 
    a.image, 
    a.image2, 
    a.details, 
    a.price, 
    a.city_id,
    c.city_name,
    qa.sort_order,
qa.activity_date
FROM quatation_activities qa 
JOIN activity a ON qa.activity_id = a.id 
JOIN city c ON a.city_id = c.id 
WHERE qa.quotation_id = '$id' 
ORDER BY qa.sort_order ASC";

    $resultActivitiesDetails = mysqli_query($conn, $sqlActivitiesDetails);

    // Keep activities in exact itinerary order from DB
    $cityActivities = [];
    $orderedActivities = [];
    $lastRenderedDate = '';
    while ($activity = mysqli_fetch_assoc($resultActivitiesDetails)) {
        $cityId = $activity['city_id'];
        $cityActivities[$cityId][] = $activity;
        $orderedActivities[] = $activity;
    }

    // Activity Card
    // if (!empty($cityActivities)) {

    //     foreach ($citiesInOrder as $cityInfo) {
    //         $cityId = $cityInfo['id'];
    //         $cityName = $cityInfo['name'];
    //         if (!isset($cityActivities[$cityId])) continue;

    //         foreach ($cityActivities[$cityId] as $activity) {
    //             $carouselId = 'carousel_' . $activity['id'];
    //         }
    //     }
    // }

    $statesql = "SELECT state_id FROM quatation_cities WHERE quotation_id = '$id'";
    $stateresult = mysqli_query($conn, $statesql);
    $stateRow = mysqli_fetch_assoc($stateresult);
    $state = $stateRow['state_id'];
    // echo "State is : " . $state;
    // echo "<br>";

    // if ($state == 4) {


    if ($cityCount == 1) {

        $sqlTransfersDetails = "SELECT 
                                t.id, 
                                t.name AS transfername, 
                                tscp.price,
                                v.name AS vehiclename,
                                p.name AS pickup_name,
                                d.name AS drop_name
                            FROM quatation_transfers qt 
                            JOIN transfer t ON qt.transfer_id = t.id 
                            JOIN transfer_single_city_price tscp 
                                ON qt.transfer_id = tscp.transfer_id
                                AND qt.vehicle_id = tscp.vehicle_id
                            JOIN vehicle v ON tscp.vehicle_id = v.id
                            LEFT JOIN pickupdrop p ON tscp.pickup_id = p.id
                            LEFT JOIN pickupdrop d ON tscp.drop_id = d.id
                            WHERE qt.quotation_id = '$id'
                            AND tscp.city_id = '$cityId'";
    } else {

        // ✅ MULTIPLE CITY
        $sqlTransfersDetails = "SELECT 
                                t.id, 
                                t.name AS transfername, 
                                tvc.price, 
                                v.name AS vehiclename, 
                                qt.seater AS seater_id,
                                s.name AS seater_name
                            FROM quatation_transfers qt 
                            JOIN transfer t ON qt.transfer_id = t.id 
                            JOIN transfer_vehicle_price tvc 
                                ON qt.transfer_id = tvc.transfer_id 
                                AND qt.vehicle_id = tvc.vehicle_id
                            JOIN vehicle v ON tvc.vehicle_id = v.id
                            LEFT JOIN seater s ON qt.seater = s.id
                            WHERE qt.quotation_id = '$id'";
    }
    $resultTransfersDetails = mysqli_query($conn, $sqlTransfersDetails);


    $shownTransfers = [];

    // while ($transfer = mysqli_fetch_assoc($resultTransfersDetails)) {

    //     $transferKey = $transfer['transfername'] . '_' . $transfer['vehiclename'];

    //     if (!in_array($transferKey, $shownTransfers)) {



    //         $vehicle = htmlspecialchars($transfer['vehiclename']);
    //         $transfername    = htmlspecialchars($transfer['transfername']);
    //         $price   = htmlspecialchars($transfer['price']);
    //         $pickup2 = $transfer['pickup_name'];
    //         $drop2 = $transfer['drop_name'];



    //         $shownTransfers[] = $transferKey;
    //     }
    // }


    // }


    $sql = "
   SELECT 
    q.vehicle_id, 
    vh.name AS vehicle_name,
    q.vehicleQuantity, 
    v.price,
    q.nights,
    s.name AS seater_name,

    v.pickup_id, 
    v.drop_id,

    p.name AS pickup_name, 
    d.name AS drop_name,

    qc.city_id,
    qc.state_id

FROM quatation q

-- ✅ CITY JOIN
JOIN quatation_cities qc 
    ON qc.quotation_id = q.id

-- ✅ VEHICLE
JOIN vehicle vh
    ON vh.id = q.vehicle_id

-- ✅ VEHICLE PRICE
JOIN vehicle_price v 
    ON v.vehicle_id = q.vehicle_id
    AND v.state_id = qc.state_id

    -- ✅ FIX MONTH 01 = 1
    AND v.month = (q.travelMonth + 0)

    -- ✅ MATCH PICKUP / DROP
    AND v.pickup_id = q.pickup_id
    AND v.drop_id   = q.drop_id

-- ✅ SEATER
LEFT JOIN seater s 
    ON s.id = v.seater_id

-- ✅ PICKUP
LEFT JOIN pickupdrop p 
    ON v.pickup_id = p.id

-- ✅ DROP
LEFT JOIN pickupdrop d 
    ON v.drop_id = d.id

WHERE q.id = ?

-- ✅ REMOVE DUPLICATES
GROUP BY 
    q.vehicle_id, 
    v.pickup_id, 
    v.drop_id, 
    v.seater_id,
    qc.city_id

LIMIT 1
";


    // ================= PREPARE =================
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("SQL Error: " . $conn->error);
    }

    // ================= BIND =================
    $stmt->bind_param("i", $id);

    // ================= EXECUTE =================
    $stmt->execute();
    $result = $stmt->get_result();

    // ================= CHECK =================
    if ($result && $result->num_rows > 0) {

        while ($row = $result->fetch_assoc()) {

            $vehicleName = htmlspecialchars($row['vehicle_name']);
            $price       = floatval($row['price']);
            
            
            $pickup3 = $row['pickup_id'];
            // echo $pickup3;
            // echo "<br>";
            $pickup1     = htmlspecialchars($row['pickup_name'] ?? '');
            $drop1       = htmlspecialchars($row['drop_name'] ?? '');
            // echo $drop1;
            // echo "<br>";
            $seater      = htmlspecialchars($row['seater_name'] ?? '');
            $qty         = intval($row['vehicleQuantity'] ?? 1);



            // ✅ DAYS
            $days = $nights + 1;

            // ✅ TOTAL
            $totalcabprice = $days * $price * $qty;

            $pickDropDetails = ['vehicle_name' => $vehicleName, 'price' => $price, 'pickup' => $pickup1, 'drop' => $drop1, 'seater' => $seater, 'qty' => $qty, 'total_price' =>   $totalcabprice];
        }
    } else {
        //echo "No vehicle data found!";
    }

    if ($state == 4) {




        $sqlPickupdrop = "
    SELECT 
        qt.pickup_id, 
        qt.drop_id, 
        p.name AS Pickupname, 
        d.name AS Dropname
    FROM quatation_transfers qt
    LEFT JOIN pickupdrop p ON p.id = qt.pickup_id
    LEFT JOIN pickupdrop d ON d.id = qt.drop_id
";

        $resultPickupDrop = mysqli_query($conn, $sqlPickupdrop);
        while ($pickupdroprow = mysqli_fetch_assoc($resultPickupDrop)) {
            $pickup = $pickupdroprow['Pickupname'];
            $drop = $pickupdroprow['Dropname'];
        }
        // echo "Pickup From : " . $pickup;
        // echo "<br>";
        // echo "Drop To : " . $drop;
        // echo "<br>";
    }

    $sqlHotelsTotal = "SELECT SUM(total_price) AS total_sum FROM quatation_hotels WHERE quotation_id = '$id'";
    $resultHotelsTotal = mysqli_query($conn, $sqlHotelsTotal);
    $hotelTotalPrice = mysqli_fetch_assoc($resultHotelsTotal)['total_sum'] ?? 0;

    $roomMultiplier = 1; // max(1, ($pax / 2));

    $hotelTotalPrice = $hotelTotalPrice * $roomMultiplier;


    // echo "Hotel Total Price : " . $hotelTotalPrice;
    // echo "<br>";

    $hotelextrabedprice = "SELECT SUM(totalextrabedprice) AS finalextrabedprice FROM quatation_hotels WHERE quotation_id = '$id'";
    $resulthotelextrabed = mysqli_query($conn, $hotelextrabedprice);
    $ExtrabedTotalprice = mysqli_fetch_assoc($resulthotelextrabed)['finalextrabedprice'] ?? 0;
    // echo "Total Extra Bed Price : " . $ExtrabedTotalprice;
    // echo "<br>";

    $hotelchildbedprice = "SELECT SUM(totalchildbedprice) AS finalchildbedprice FROM quatation_hotels WHERE quotation_id = '$id'";
    $resulthotelchildbed = mysqli_query($conn, $hotelchildbedprice);
    $ChildbedTotalprice = mysqli_fetch_assoc($resulthotelchildbed)['finalchildbedprice'] ?? 0;
    // echo "Total Child Bed Price : " . $ChildbedTotalprice;
    // echo "<br>";

    // Display the total price of all hotels
    $sqlActivities = "SELECT SUM(a.price) as total FROM quatation_activities qa 
                            JOIN activity a ON qa.activity_id = a.id 
                            WHERE qa.quotation_id = '$id'";
    $resultActivities = mysqli_query($conn, $sqlActivities);
    $activityTotalPrice = mysqli_fetch_assoc($resultActivities)['total'] ?? 0;
    // echo "Activity Price : " . $activityTotalPrice;
    // echo "<br>";

    $sqlActivityTransfer = "SELECT 
                                    SUM(sedan_price) AS total_sedan_price,
                                    SUM(suv_price) AS total_suv_price,
                                    SUM(van_price) AS total_van_price,
                                    SUM(dzire_price) AS total_dzire_price,
                                    SUM(innova_price) AS total_innova_price,
                                    SUM(winger_price) AS total_winger_price,
                                    SUM(tempo_price) AS total_tempo_price,
                                    SUM(bus_price) AS total_bus_price
                                    
                                FROM (
                                    SELECT 
                                        MAX(CASE WHEN av.vehicle_id = 4 THEN av.transfer_price END) AS sedan_price,
                                        MAX(CASE WHEN av.vehicle_id = 5 THEN av.transfer_price END) AS suv_price,
                                        MAX(CASE WHEN av.vehicle_id = 6 THEN av.transfer_price END) AS van_price,
                                        MAX(CASE WHEN av.vehicle_id = 7 THEN av.transfer_price END) AS dzire_price,
                                        MAX(CASE WHEN av.vehicle_id = 8 THEN av.transfer_price END) AS innova_price,
                                        MAX(CASE WHEN av.vehicle_id = 9 THEN av.transfer_price END) AS winger_price,
                                        MAX(CASE WHEN av.vehicle_id = 10 THEN av.transfer_price END) AS tempo_price,
                                        MAX(CASE WHEN av.vehicle_id = 11 THEN av.transfer_price END) AS bus_price
                                    FROM quatation_activities qa  
                                    LEFT JOIN activity_vehicle av 
                                        ON qa.activity_id = av.activity_id 
                                        AND qa.vehicle_id = av.vehicle_id  -- Ensure vehicle_id is matched
                                    WHERE qa.quotation_id = '$id'
                                    GROUP BY qa.activity_id
                                ) AS vehicle_prices";
                                
                                
                                
//                                 $sqlActivityTransfer = "
//     SELECT SUM(av.transfer_price) AS grand_total
//     FROM quatation_activities qa
//     LEFT JOIN activity_vehicle av
//         ON qa.activity_id = av.activity_id
//         AND qa.vehicle_id = av.vehicle_id
//     WHERE qa.quotation_id = '$id'
// ";


$sqlActivityTransfer = "
    SELECT SUM(price) AS grand_total
    FROM (
        SELECT
            qa.activity_id,
            qa.vehicle_id,
            MAX(av.transfer_price) AS price
        FROM quatation_activities qa
        LEFT JOIN activity_vehicle av
            ON qa.activity_id = av.activity_id
            AND qa.vehicle_id = av.vehicle_id
        WHERE qa.quotation_id = '$id'
        GROUP BY qa.activity_id, qa.vehicle_id
    ) t
";

$resultActivityTransfer = mysqli_query($conn, $sqlActivityTransfer);
$row = mysqli_fetch_assoc($resultActivityTransfer);

$grandActivityVehicleGrandTotal = $row['grand_total'] ?? 0;

    $resultActivityTransfer = mysqli_query($conn, $sqlActivityTransfer);
    
    
    

    
    
    
       if (!empty($_POST['activities'])) {
            $activities = $_POST['activities']; // This will be a nested array
            $activityStmt = $conn->prepare("INSERT INTO quatation_activities (quotation_id, activity_id, city_id, state_id, vehicle_id, register_id) VALUES (?, ?, ?, ?, ?, ?)");

            foreach ($activities as $group) { // Each group (state/city selection)
                foreach ($group as $cityId => $activityList) { // Each city
                    foreach ($activityList as $activityId) { // Each activity
                        // Fetch city & state from DB
                        $activityQuery = $conn->prepare("SELECT city_id, state_id FROM activity WHERE id = ?");
                        $activityQuery->bind_param('i', $activityId);
                        $activityQuery->execute();
                        $activityResult = $activityQuery->get_result();
                        if ($activityRow = $activityResult->fetch_assoc()) {
                            $activityCityId = $activityRow['city_id'];
                            // echo $activityCityId;
                            // echo "<br>";
                            $activityStateId = $activityRow['state_id'];
                            $activityStmt->bind_param('iiiiii', $quotationId, $activityId, $activityCityId, $activityStateId, $vehicle, $id);
                            $activityStmt->execute();
                        }
                    }
                }
            }
        }
    
    
    
    
    
    
    
    
    
    
    $row = mysqli_fetch_assoc($resultActivityTransfer);

    $etiosPrice = $row['total_sedan_price'] ?? 0;
    $ertigaPrice = $row['total_suv_price'] ?? 0;
    $cristaPrice = $row['total_van_price'] ?? 0;
    $dzirePrice = $row['total_dzire_price'] ?? 0;
    $innovaPrice = $row['total_innova_price'] ?? 0;
    $wingerPrice = $row['total_winger_price'] ?? 0;
    $tempoPrice = $row['total_tempo_price'] ?? 0;
    $busPrice = $row['total_bus_price'] ?? 0;

    // echo "Etios Total Price : " . $etiosPrice;
    // echo "<br>";
    // echo "Ertiga Total Price : " . $ertigaPrice;
    // echo "<br>";
    // echo "Crista Total Price : " . $cristaPrice;
    // echo "<br>";
    // echo "Dzire - Ac Total Price : " . $dzirePrice;
    // echo "<br>";
    // echo "Innova - Ac Total Price : " . $innovaPrice;
    // echo "<br>";
    // echo "Winger - Ac Total Price : " . $wingerPrice;
    // echo "<br>";
    // echo "Tempo Traveller - Ac Total Price : " . $tempoPrice;
    // echo "<br>";
    // echo "Bus - Ac Total Price : " . $busPrice;
    // echo "<br>";

    if ($cityCount == 1) {

        $sqlTransfers = "
        SELECT tscp.price AS total 
        FROM quatation_transfers qt
        JOIN transfer_single_city_price tscp 
            ON qt.transfer_id = tscp.transfer_id
            AND qt.vehicle_id = tscp.vehicle_id
        WHERE qt.quotation_id = '$id'
        AND tscp.city_id = '$cityId'
    ";
    } else {

        // ✅ MULTIPLE CITY
        $sqlTransfers = "
        SELECT tvp.price AS total 
        FROM quatation_transfers qt
        JOIN transfer_vehicle_price tvp 
            ON qt.transfer_id = tvp.transfer_id 
            AND qt.vehicle_id = tvp.vehicle_id
        WHERE qt.quotation_id = '$id'
    ";
    }

    // Execute query
    $resultTransfers = mysqli_query($conn, $sqlTransfers);

    // Fetch total safely
    $row = mysqli_fetch_assoc($resultTransfers);
    $transferTotalPrice = $row['total'] ?? 0;

    // Output
    // echo "Total Transfer Price : " . $transferTotalPrice;
    // echo "<br>";

    if ($state != 4) {
        $totalTranferPrice = $totalcabprice;
        // echo "Total Transfer Price is : " . $totalTranferPrice;
        // echo "<br>";
    }

//print_R($totalcabprice); exit;

    $totalPeople = $pax + $extraAdult + $childBed;
    // echo "Total People : " . $totalPeople;
    // echo "<br>";

    $totalPrice = $activityTotalPrice * $totalPeople;
    // echo "Total Activity Price : " . $totalPrice;
    // echo "<br>";

    $totalTransfer = $transferTotalPrice  + $grandActivityVehicleGrandTotal;// + $etiosPrice + $ertigaPrice + $cristaPrice + $dzirePrice + $innovaPrice + $wingerPrice + $tempoPrice + $busPrice;
    


    $totalTransfer2 = $totalTransfer * $vehicleQuantity;
    
     
    // echo "Total Transfer With Activity : " . $totalTransfer;
    // echo "<br>";
    // echo "Total Transfer With Activity with total Quantity of Vehicle : " . $totalTransfer2;
    // echo "<br>";

    $Price = $hotelTotalPrice  + $totalTransfer2 + $totalPrice;
    
    
 
    // echo "Total Price : " . $Price;
    // echo "<br>";

    if ($state != 4) {
        $Price = $hotelTotalPrice  + $totalTransfer2 + $totalPrice + $totalcabprice;
        
      
        // echo "Total Price : " . $Price;
        // echo "<br>";
    }
    $totalextraAdult = $ExtrabedTotalprice;
    // echo "Total Extra Adult Cost with Total Night : " . $totalextraAdult;
    // echo "<br>";

    $totalChildBed = $ChildbedTotalprice;
    // echo "Total Child Cost with Total Night : " . $totalChildBed;
    // echo "<br>";


}

function formatRoadmapDate($date)
{
    $timestamp = strtotime($date);

    $dayName = date('l', $timestamp);
    $month   = date('F', $timestamp);
    $day     = date('j', $timestamp);
    $year    = date('Y', $timestamp);

    $suffix = 'th';

    if (($day % 10) == 1 && $day != 11) {
        $suffix = 'st';
    } elseif (($day % 10) == 2 && $day != 12) {
        $suffix = 'nd';
    } elseif (($day % 10) == 3 && $day != 13) {
        $suffix = 'rd';
    }

    return $dayName . ', ' . $month . ' ' . $day . $suffix . ', ' . $year;
}



$transferPerPerson = $totalTransfer2 / $totalPeople;



?>





<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">


<style>
    :root {
        --primary: #066168;
        --dark: #0f172a;
        --soft: #64748b;
        --border: #e2e8f0;
        --bg: #f1f5f9;
    }

    * {
        box-sizing: border-box;
    }

    /* 
    body {
        background:
            radial-gradient(circle at top left, rgba(6, 97, 104, .08), transparent 30%),
            radial-gradient(circle at bottom right, rgba(6, 97, 104, .08), transparent 30%),
            var(--bg);
        font-family: 'Inter', 'Segoe UI', sans-serif;
        color: var(--dark);
    } */

    .main-bar-wraper {
        position: relative !important;
        z-index: 999999999 !important;
    }

    .dashboard {
        max-width: 1700px;
        margin: auto;
        padding: 120px 24px 120px;
    }

    .glass-card {
        background: rgba(255, 255, 255, .82);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, .6);
        border-radius: 30px;
        box-shadow: 0 12px 40px rgba(15, 23, 42, .08);
    }

    .hero-header {
        padding: 34px;
        margin-bottom: 28px;
    }

    @media(max-width:768px) {
        .dashboard {
            padding: 100px 14px 120px;
        }

        .floating-actions {
            padding: 6px;
        }

        .dashboard {
            padding: 7px !important;
        }
    }


    .hero-title {
        font-size: 48px;
        font-weight: 800;
        color: var(--primary);
        margin: 0;
    }

    .hero-subtitle {
        margin-top: 10px;
        color: var(--soft);
        font-size: 17px;
    }

    .section-card {
        padding: 28px;
        margin-bottom: 26px;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .section-head h2 {
        margin: 0;
        font-size: 34px;
        color: var(--primary);
        font-weight: 800;
    }

    .section-head span {
        color: var(--soft);
    }

    .travel-card {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 18px;
        margin-bottom: 22px;
        transition: .35s;
    }

    .travel-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 18px 40px rgba(15, 23, 42, .08);
    }

    .travel-layout {
        display: flex;
        gap: 24px;
    }

    .travel-image {
        width: 190px;
        min-width: 190px;
        position: relative;
    }

    .travel-image img {
        width: 100%;
        height: 240px;
        object-fit: cover;
        border-radius: 22px;
    }

    .price-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(6, 97, 104, .95);
        color: #fff;
        padding: 10px 16px;
        border-radius: 16px;
        font-weight: 700;
    }

    .travel-content {
        flex: 1;
    }

    .travel-title {
        font-size: 30px;
        font-weight: 800;
        margin: 0;
    }

    .travel-location {
        margin-top: 10px;
        color: var(--primary);
        font-weight: 600;
    }

    .travel-desc {
        margin-top: 18px;
        color: var(--soft);
        line-height: 1.8;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-top: 24px;
    }

    .info-box {
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
    }

    .info-box small {
        display: block;
        color: var(--soft);
        margin-bottom: 7px;
    }

    .quote-card {
        padding: 28px;
        background: linear-gradient(135deg, #066168, #0d9488);
        color: #fff;
    }

    .quote-card h3 {
        margin-top: 0;
        font-size: 34px;
    }

    .quote-row {
        display: flex;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid rgba(255, 255, 255, .15);
    }

    .quote-total {
        font-size: 38px;
        font-weight: 800;
        margin-top: 20px;
    }

    .floating-actions {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        background: rgba(255, 255, 255, .97);
        backdrop-filter: blur(18px);
        border-top: 1px solid rgba(226, 232, 240, .9);
        box-shadow: 0 -10px 40px rgba(15, 23, 42, .08);
        padding: 14px 24px;
        z-index: 9999;
    }

    .action-grid {
        max-width: 1700px;
        /* margin: auto; */
        display: grid;
        justify-self: right;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .action-btn {
        border: none;
        border-radius: 18px;
        padding: 16px;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        transition: .3s;
        width: 100%;
    }

    .action-btn:hover {
        transform: translateY(-2px);
    }

    .primary {
        background: #066168;
    }

    .green {
        background: #059669;
    }

    .blue {
        background: #2563eb;
    }

    .orange {
        background: #d97706;
    }



    @media(max-width:768px) {

        .action-btn {

            border: none;

            border-radius: 18px;

            padding: 6px 14px 6px;

            color: #fff;

            font-weight: 700;

            cursor: pointer;

            transition: .3s;

            width: 100%;
        }

    }

    @media(max-width:991px) {

        .travel-layout {
            flex-direction: column;
        }

        .travel-image {
            width: 100%;
        }

        .travel-image img {
            height: 300px;
        }

        .info-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .action-grid {
            max-width: 1700px;
            justify-self: right;
            grid-template-columns: repeat(2, 1fr);
        }

        @media(max-width:768px) {
            .dashboard {
                padding: 100px 14px 120px;
            }

            .floating-actions {
                padding: 12px;
            }
        }

        .hero-title {
            font-size: 38px;
        }
    }

    :root {
        --primary: #066168;
        --dark: #0f172a;
        --soft: #64748b;
        --border: #e2e8f0;
        --bg: #f1f5f9;
    }

    * {
        box-sizing: border-box;
    }


    .dashboard {
        max-width: 1700px;
        margin: auto;
        padding: 28px;
    }

    .topbar {
        /*margin-top: 139px;*/
        margin-bottom: 21px;
        background: rgba(255, 255, 255, .75);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, .5);
        border-radius: 30px;
        padding: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        box-shadow: 0 10px 40px rgba(15, 23, 42, .06);
    }

    .brand h1 {
        margin: 0;
        font-size: 42px;
        font-weight: 800;
        color: var(--primary);
    }

    .brand p {
        margin: 8px 0 0;
        color: var(--soft);
    }

    .top-stats {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
    }

    .stat {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 16px 22px;
        /* min-width:150px; */
    }

    .stat span {
        display: block;
        color: var(--soft);
        font-size: 13px;
    }

    .stat strong {
        display: block;
        margin-top: 6px;
        font-size: 20px;
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 30px;
        margin-top: 30px;
    }

    .panel {
        background: rgba(255, 255, 255, .85);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, .7);
        border-radius: 30px;
        padding: 28px;
        box-shadow: 0 15px 50px rgba(15, 23, 42, .08);
    }

    .panel-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .panel-title h2 {
        margin: 0;
        font-size: 34px;
        color: var(--primary);
    }

    .panel-title span {
        color: var(--soft);
    }

    .travel-card {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 20px;
        margin-bottom: 22px;
        transition: .35s;
        overflow: hidden;
    }

    .travel-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 18px 40px rgba(15, 23, 42, .08);
    }

    .travel-row {
        display: flex;
        gap: 24px;
    }

    .travel-image {
        width: 190px;
        min-width: 190px;
        position: relative;
    }

    .travel-image img {
        width: 100%;
        height: 240px;
        object-fit: cover;
        border-radius: 22px;
    }

    .price-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(6, 97, 104, .92);
        color: #fff;
        padding: 10px 16px;
        border-radius: 16px;
        font-weight: 700;
        backdrop-filter: blur(12px);
    }

    .travel-content {
        flex: 1;
    }

    .travel-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
    }

    .travel-title {
        font-size: 30px;
        font-weight: 800;
        margin: 0;
    }

    .location {
        margin-top: 10px;
        color: var(--primary);
        font-weight: 600;
    }

    .desc {
        margin-top: 18px;
        color: var(--soft);
        line-height: 1.8;
    }

    .grid-info {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-top: 24px;
    }

    .info {
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
    }

    .info small {
        display: block;
        color: var(--soft);
        margin-bottom: 8px;
    }

    .info strong {
        font-size: 16px;
    }

    .sidebar {
        position: sticky;
        /* top: 20px; */
        top: 176px;
        height: fit-content;
    }

    .quote-box {
        background: linear-gradient(135deg, #066168, #0d9488);
        color: #fff;
        border-radius: 28px;
        padding: 28px;
        margin-bottom: 22px;
        box-shadow: 0 18px 40px rgba(6, 97, 104, .25);
    }

    .quote-box h3 {
        margin-top: 0;
        font-size: 32px;
        color: #ffffff;
    }

    .quote-row {
        display: flex;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255, 255, 255, .15);
    }

    .quote-total {
        font-size: 34px;
        font-weight: 800;
        margin-top: 20px;
    }

    .assistant {
        background: #fff;
        border-radius: 28px;
        padding: 28px;
        border: 1px solid var(--border);
        box-shadow: 0 15px 50px rgba(15, 23, 42, .08);
    }

    .assistant h3 {
        margin-top: 0;
        font-size: 32px;
        color: var(--primary);
    }

    textarea {
        width: 100%;
        min-height: 140px;
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 18px;
        resize: none;
        font-family: inherit;
    }

    .chatbox {
        margin-top: 18px;
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 18px;
        height: 220px;
        overflow-y: auto;
        margin-bottom: 43px;
    }

    .btn {
        width: 100%;
        border: none;
        border-radius: 18px;
        padding: 16px;
        color: #fff;
        font-weight: 700;
        margin-top: 14px;
        cursor: pointer;
        transition: .3s;
    }

    .btn:hover {
        transform: translateY(-2px);
    }

    .primary {
        background: #066168;
    }

    .green {
        background: #059669;
    }

    .blue {
        background: #2563eb;
    }

    .orange {
        background: #d97706;
    }

    @media(max-width:1100px) {

        .layout {
            grid-template-columns: 1fr;
        }

        .travel-row {
            flex-direction: column;
        }

        .travel-image {
            width: 100%;
        }

        .travel-image img {
            height: 300px;
        }

        .grid-info {
            grid-template-columns: repeat(2, 1fr);
        }

        .topbar {
            flex-direction: column;
            align-items: flex-start;
            margin-top: 190px !important;
        }


    }

    @media(max-width:768px) {

        .topbar {
            flex-direction: column;
            align-items: flex-start;
            margin-top: 60px !important;
        }

    }


    .highlighter {
        background-color: #96fcff9c;
    }
</style>



<!-- Banner Style One -->



<div class="relative bg-cover bg-center w-full bg-white bg-[url(../images/background/inr-banner.jpg)] overflow-hidden">
    <div class="opacity-100 absolute left-0 top-0 size-full"></div>
    <div class="flex w-full lg:h-160 md:h-135 h-100 pb-10 items-baseline mx-auto">
        <div class="relative md:mt-60 mt-45 flex items-center justify-center w-full flex-col z-5">
            <div>
                <h2 class="lg:text-60 md:text-52 text-28 relative"><?= $title  ?></h2>
            </div>
            <!-- BREADCRUMB ROW -->
            <div>
                <ul class="inline-block">
                    <li class="text-base pr-7.5 relative inline-block font-semibold text-primary after:content-['-'] after:absolute after:right-2 after:-top-1.5 after:text-primary after:text-26 after:font-normal">
                        <a href="index.php">Home</a>
                    </li>
                    <li class="relative inline-block text-base font-semibold text-primary"><?= $title ?></li>
                </ul>
            </div>
        </div>
        <!-- BREADCRUMB ROW END -->
    </div>
    <div class="h-50 w-full absolute top-50 left-0 z-1">
        <div class="inline-block whitespace-nowrap animate-moveCloud">
            <img src="theme/images/inr-banner-cloud.png" alt="Image" class="h-47.5">
        </div>
    </div>
    <div class="absolute w-1/2 right-0 top-0 bottom-0 z-1">
        <div class="mt-60 animate-slide-right"><img src="theme/images/airplane.png" alt="Image" class="animate-slide-top-fast" width="378" height="146"></div>
    </div>
    <div class="absolute right-11.25 bottom-16.25 animate-slide-top2"><img src="theme/images/hotballon-Left.png" alt="Image" class="md:w-21 w-10" width="84" height="121"></div>
    <div class="absolute md:-right-15 -right-10 top-41.25 animate-slide-top"><img src="theme/images/hotballon-right.png" alt="Image" class="md:w-37.5 w-20"
            width="230" height="333"></div>
</div>

<div class="dashboard">


    <div class="layout">

        <div>
            <div class="topbar">

                <div class="brand">
                    <h1><?= htmlspecialchars($user_name)  ?></h1>
                    <p>Luxury itinerary dashboard experience</p>


                </div>

                <div class="top-stats">



                    <div class="stat">
                        <span>Total Nights</span>
                        <strong><?= htmlspecialchars($nights) ?></strong>
                    </div>



                    <div class="stat highlighter">
                        <span>Arrival</span>
                        <strong><?= $travelDate  ?></strong>
                    </div>


                    <div class="stat highlighter">
                        <span>Departure</span>
                        <strong><?= $travelEndDate ?></strong>
                    </div>


                    <div class="stat">
                        <span>Guests</span>
                        <strong><?= $pax ?? '0' ?> Pax</strong>
                    </div>

                    <div class="stat">
                        <span>Rooms</span>
                        <strong><?= $rooms ?? '0' ?></strong>
                    </div>


                    <div class="stat">
                        <span>Travel Month</span>
                        <strong><?= $travelMonth  ?></strong>
                    </div>

                    <div class="stat">
                        <span>Extra Bed</span>
                        <strong><?= $extraAdult  ?></strong>
                    </div>


                    <div class="stat">
                        <span>Extra Child</span>
                        <strong><?= $childBed  ?></strong>
                    </div>

                    <div class="stat">
                        <span>Extra Adults</span>
                        <strong><?= $extraAdult  ?></strong>
                    </div>








                    <div class="stat">
                        <span>Vehicle Quantity</span>
                        <strong><?= $vehicleQuantity  ?></strong>
                    </div>



                    <div class="stat">
                        <span>Total Markup</span>
                        <strong><?= $totalmarkup  ?><?= $markup  ?></strong>
                    </div>





                    <div class="stat">
                        <span>Meal Plan</span>
                        <strong><?= $mealPlanName  ?></strong>
                    </div>


                </div>



            </div>

            <div class="panel">

                <div class="panel-title">
                    <h2>Hotels</h2>
                    <span>Premium Collection</span>
                </div>

                <!-- YOUR EXISTING HOTEL LOOP GOES HERE -->





                <style>
                    .travel-image {
                        width: 180px;
                        min-width: 180px;
                        height: 220px;
                        position: relative;
                        overflow: hidden;
                        border-radius: 12px;
                    }

                    .travel-image img {
                        width: 100%;
                        height: 220px;
                        object-fit: cover;
                        display: block;
                        border-radius: 12px;
                    }

                    .custom-carousel {
                        position: relative;
                        width: 100%;
                        height: 220px;
                        overflow: hidden;
                        border-radius: 12px;
                    }

                    .custom-carousel-track {
                        display: flex;
                        transition: transform .4s ease;
                        width: 100%;
                        height: 220px;
                    }

                    .custom-carousel-slide {
                        min-width: 100%;
                        flex-shrink: 0;
                        height: 220px;
                    }

                    .custom-carousel-slide img {
                        width: 100%;
                        height: 220px;
                        object-fit: cover;
                        display: block;
                    }

                    .custom-carousel-btn {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        z-index: 5;
                        width: 28px;
                        height: 28px;
                        border: none;
                        border-radius: 999px;
                        background: rgba(0, 0, 0, 0.55);
                        color: #fff;
                        cursor: pointer;
                        font-size: 12px;
                    }

                    .custom-carousel-prev {
                        left: 6px;
                    }

                    .custom-carousel-next {
                        right: 6px;
                    }

                    @media(max-width:768px) {

                        .travel-image {
                            width: 100%;
                            min-width: 100%;
                            height: 220px;
                        }
                    }

                    .card-header {
                        padding: 16px 22px;
                        border-radius: 14px 14px 0 0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .card-header.bg-info {
                        background: linear-gradient(135deg, #066168, #0d9488)
                    }

                    .card-header h5 {
                        margin: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #ffffff;
                        font-size: 20px;
                        font-weight: 700;
                        letter-spacing: 0.3px;
                    }

                    .card-header h5 i {
                        width: 38px;
                        height: 38px;
                        border-radius: 999px;
                        background: rgba(255, 255, 255, 0.18);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        color: #ffffff;
                    }

                    .card {
                        border: none;
                        border-radius: 16px;
                        overflow: hidden;
                        background: #ffffff;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
                    }

                    .card-body {
                        padding: 24px;
                    }

                    @media(max-width:768px) {

                        .card-header {
                            padding: 14px 16px;
                        }

                        .card-header h5 {
                            font-size: 17px;
                        }

                        .card-header h5 i {
                            width: 32px;
                            height: 32px;
                            font-size: 14px;
                        }

                        .card-body {
                            padding: 16px;
                        }
                    }
                </style>


                <?php

                if (!empty($cityHotels)) {

                    echo "<div class='card mb-4'>";

                    echo "<div class='card-header bg-info text-white'>
            <h5 class='mb-0'>
                <i class='fas fa-hotel me-2'></i>
                Hotels & Nights
            </h5>
          </div>";

                    echo "<div class='card-body'>";
                    $shownHotelCities = [];
                    foreach ($citiesInOrder as $cityInfo) {

                        $cityId   = $cityInfo['id'];
                        $cityName = $cityInfo['name'];


                        if (in_array($cityId, $shownHotelCities)) {
                            continue;
                        }
                        $shownHotelCities[] = $cityId;
                        if (!isset($cityHotels[$cityId])) {
                            continue;
                        }

                        echo "<div class='mb-4 ml-4'>";

                        foreach ($cityHotels[$cityId] as $hotel) {

                            $images = [];

                            if (!empty($hotel['hotel_front_image'])) {
                                $images[] = "uploads/hotels/" . $hotel['hotel_front_image'];
                            }

                            if (!empty($hotel['bedroom_image'])) {
                                $images[] = "uploads/hotels/" . $hotel['bedroom_image'];
                            }

                            if (empty($images)) {
                                $images[] = "uploads/hotels/demo.jpg";
                            }

                            $carouselId = 'hotelCarousel_' . $hotel['hotel_id'];

                            $hotelPrice      = (float)$hotel['total_price'];
                            $extraBedPrice   = (float) isset($hotel['total_extra_bed_price']) ? (float)$hotel['total_extra_bed_price']  : 0;
                            $childBedPrice   = (float)  isset($hotel['total_child_bed_price']) ? (float)$hotel['total_child_bed_price'] : 0;

                            $finalHotelPrice = $hotelPrice + $extraBedPrice + $childBedPrice;



                            echo "

            <div class='travel-card mb-4'>

                <div class='travel-row'>

                    <div class='travel-image'>";

                            /* ===== SINGLE IMAGE ===== */

                            if (count($images) == 1) {

                                echo "
                            <img src='{$images[0]}'>";
                            }

                            /* ===== MULTIPLE IMAGES ===== */ else {

                                echo "

                            <div class='custom-carousel'
                                 id='{$carouselId}'>

                                <div class='custom-carousel-track'>";

                                foreach ($images as $img) {

                                    echo "
                                        <div class='custom-carousel-slide'>
                                            <img src='{$img}'>
                                        </div>";
                                }

                                echo "

                                </div>

                                <button type='button'
                                        class='custom-carousel-btn custom-carousel-prev'>

                                    &#10094;

                                </button>

                                <button type='button'
                                        class='custom-carousel-btn custom-carousel-next'>

                                    &#10095;

                                </button>

                            </div>
                            ";
                            }

                            echo "

                        <div class='price-badge'>
                            ₹ " . maskNumber($finalHotelPrice) . "
                        </div>

                    </div>

                    <div class='travel-content'>

                        <div class='travel-header'>



                            <div>

                                <h3 class='travel-title'>
                                    " . htmlspecialchars($hotel['hotel_name']) . "
                                </h3>

                                <div class='location'>
                                    " . htmlspecialchars($cityName) . ",
                                    " . htmlspecialchars($hotel['state_name']) . "
                                </div>

                            </div>

                        </div>

                     

                        <div class='grid-info'>

                            <div class='info'>
                                <small>Nights</small>
                                <strong>{$hotel['city_nights']} Nights</strong>
                            </div>

                         

                       
                        

                        </div>

                    </div>

                </div>

            </div>

            ";
                        }

                        echo "</div>";
                    }

                    echo "</div>";
                    echo "</div>";
                }



                /* =========================================================
   ACTIVITIES
========================================================= */

                if (!empty($cityActivities)) {

                    echo "<div class='card mb-4'>";

                    echo "<div class='card-header bg-info text-white'>
            <h5 class='mb-0'>
                <i class='fas fa-person-hiking me-2'></i>
                Activities
            </h5>
          </div>";

                    echo "<div class='card-body'><div class='activity-timeline'>";

                    echo "<div class='mb-4'>";
                    echo "<div class='activity-sortable'>";

                    foreach ($orderedActivities as $activity) {

                        $cityId = $activity['city_id'];
                        $cityName = $activity['city_name'];

                        $images = [];

                        // if (!empty($activity['image'])) {
                        //     $images[] = "uploads/hotels/" . $activity['image'];
                        // }

                        // if (!empty($activity['image2'])) {
                        //     $images[] = "uploads/hotels/" . $activity['image2'];
                        // }

                        // if (empty($images)) {
                        //     $images[] = "uploads/hotels/demo.jpg";
                        // }

                        $images = [];

                        /* =====================================
ARRIVAL IMAGE
===================================== */

                        if (
                            strtolower(trim($activity['name'])) ==
                            strtolower(ACTIVITY_ARRIVAL)
                        ) {

                            $images[] = "images/arrival.png";
                        }

                        /* =====================================
DEPARTURE IMAGE
===================================== */ elseif (
                            strtolower(trim($activity['name'])) ==
                            strtolower(ACTIVITY_DEPARTURE)
                        ) {

                            $images[] = "images/departure.png";
                        }

                        /* =====================================
NORMAL ACTIVITY IMAGES
===================================== */ else {

                            if (!empty($activity['image'])) {

                                $images[] =
                                    "uploads/hotels/" .
                                    $activity['image'];
                            }

                            if (!empty($activity['image2'])) {

                                $images[] =
                                    "uploads/hotels/" .
                                    $activity['image2'];
                            }

                            if (empty($images)) {

                                $images[] =
                                    "uploads/hotels/demo.jpg";
                            }
                        }

                        $carouselId = 'activityCarousel_' . $activity['id'];

                        $currentDate = !empty($activity['activity_date'])
                            ? $activity['activity_date']
                            : $travelDate;

                        /* DAY NUMBER FROM TRAVEL START */

                        $travelStart = new DateTime($travelDate);
                        $activityDay = new DateTime($currentDate);

                        $diff = $travelStart->diff($activityDay);

                        $currentDay = $diff->days + 1;



                        $currentDate = !empty($activity['activity_date'])
                            ? $activity['activity_date']
                            : $travelDate;

                        $travelStart = new DateTime($travelDate);
                        $activityDay = new DateTime($currentDate);

                        $diff = $travelStart->diff($activityDay);

                        $currentDay = $diff->days + 1;

                        /* =====================================
SHOW DOT ONLY ON NEW DATE
===================================== */

                        $isNewDate =
                            $lastRenderedDate != $currentDate;

                        $lastRenderedDate =
                            $currentDate;

                        echo "<div class='timeline-item'>";

                        if ($isNewDate) {

                            echo "<div class='timeline-dot'>";

                            $activityNameLower =
                                strtolower(trim($activity['name']));

                            if (
                                $activityNameLower ==
                                strtolower(ACTIVITY_ARRIVAL)
                            ) {

                                echo "
        <i class='fa-solid fa-plane-arrival'></i>";
                            } elseif (

                                $activityNameLower ==
                                strtolower(ACTIVITY_DEPARTURE)

                            ) {

                                echo "
        <i class='fa-solid fa-plane-departure'></i>";
                            } else {

                                echo $currentDay;
                            }

                            echo "

    <span class='timeline-dot-date'>

        " . date('d M', strtotime($currentDate)) . "

    </span>

    </div>";
                        }
                        echo "


    <div class='travel-card activity-item mb-4'
         data-id='{$activity['id']}'>

                <div class='travel-row'>

                    <div class='travel-image'>";

                        /* ===== SINGLE IMAGE ===== */

                        if (count($images) == 1) {

                            echo "
                            <img src='{$images[0]}'>";
                        }

                        /* ===== MULTIPLE IMAGES ===== */ else {

                            echo "

                            <div class='custom-carousel'
                                 id='{$carouselId}'>

                                <div class='custom-carousel-track'>";

                            foreach ($images as $img) {

                                echo "
                                        <div class='custom-carousel-slide'>
                                            <img src='{$img}'>
                                        </div>";
                            }

                            echo "

                                </div>

                                <button type='button'
                                        class='custom-carousel-btn custom-carousel-prev'>

                                    &#10094;

                                </button>

                                <button type='button'
                                        class='custom-carousel-btn custom-carousel-next'>

                                    &#10095;

                                </button>

                            </div>
                            ";
                        }

                        echo "

                     

                    </div>

                    <div class='travel-content'>

                       <div class='travel-header'>

    <div style='width:100%;'>

       

       

                                <h3 class='travel-title'>
                                    " . htmlspecialchars($activity['name']) . "
                                </h3>

                                <div class='location'>
                                    " . htmlspecialchars($cityName) . "
                                </div>

                            </div>

                            

                        </div>

                        <div class='desc'>
                            " . htmlspecialchars($activity['details']) . "
                        </div>


                    </div>

                </div>

          </div>

</div>

";
                    }

                    echo "</div>";
                    echo "</div>";

                    echo "</div>";
                    echo "</div>";
                    echo "</div>";
                }


                ?>

                <script>
                    document.querySelectorAll('.custom-carousel').forEach(function(carousel) {

                        let track = carousel.querySelector('.custom-carousel-track');
                        let slides = carousel.querySelectorAll('.custom-carousel-slide');

                        let prevBtn = carousel.querySelector('.custom-carousel-prev');
                        let nextBtn = carousel.querySelector('.custom-carousel-next');

                        let index = 0;

                        function updateCarousel() {

                            track.style.transform =
                                'translateX(-' + (index * 100) + '%)';
                        }

                        nextBtn.addEventListener('click', function() {

                            index++;

                            if (index >= slides.length) {
                                index = 0;
                            }

                            updateCarousel();
                        });

                        prevBtn.addEventListener('click', function() {

                            index--;

                            if (index < 0) {
                                index = slides.length - 1;
                            }

                            updateCarousel();
                        });

                    });
                </script>

            </div>





            <style>
                .transfer-section {
                    margin-top: 35px;
                }

                .transfer-section .section-header {
                    margin-bottom: 20px;
                }

                .transfer-section .section-header h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .transfer-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .transfer-card {
                    /* background: #fff;
                    border: 1px solid #dbe4ea; */
                    border-radius: 18px;
                    /* padding: 20px; */
                    transition: .3s ease;
                    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
                }

                .transfer-card:hover {
                    border-color: #066168;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 24px rgba(6, 97, 104, 0.08);
                }

                .transfer-top {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 18px;
                }

                .transfer-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: #fff;
                    color: #066168;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    flex-shrink: 0;
                }

                .transfer-title-wrap h4 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.4;
                }

                .transfer-title-wrap h4 span {
                    color: #066168;
                    font-size: 15px;
                    font-weight: 600;
                }

                .transfer-body {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .transfer-info {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    background: #f8fafc;
                    border-radius: 14px;
                    padding: 14px;
                }

                .transfer-info i {
                    color: #066168;
                    font-size: 18px;
                    margin-top: 3px;
                }

                .transfer-info label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 4px;
                }

                .transfer-info p {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                }

                .transfer-price {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #066168;
                    color: #fff;
                    border-radius: 14px;
                    padding: 12px 18px;
                    font-size: 18px;
                    font-weight: 700;
                    width: fit-content;
                }

                @media(max-width:768px) {



                    .transfer-top {
                        align-items: flex-start;
                    }

                    .transfer-title-wrap h4 {
                        font-size: 16px;
                    }

                    .transfer-price {
                        width: 100%;
                    }

                }

                .activity-timeline {

                    position: relative;

                    padding-left: 72px;

                    margin-top: 20px;
                }

                .timeline-item {

                    position: relative;

                    padding-bottom: 40px;
                }

                /* =====================================
MAIN VERTICAL LINE
===================================== */

                /* =====================================
ONE CONTINUOUS ROADMAP LINE
===================================== */

                .activity-timeline::before {

                    content: "";

                    position: absolute;

                    left: 49px;

                    top: 34px;

                    bottom: 34px;

                    width: 5px;

                    border-radius: 999px;

                    background:
                        linear-gradient(to bottom,
                            #14b8a6 0%,
                            #0f766e 40%,
                            #066168 70%,
                            #94a3b8 100%);

                    box-shadow:
                        0 0 14px rgba(20, 184, 166, .18);
                }

                /* =====================================
DOT
===================================== */

                .timeline-dot {

                    position: absolute;

                    left: -62px;

                    top: 14px;

                    width: 82px;

                    min-height: 82px;

                    border-radius: 24px;

                    background:
                        linear-gradient(135deg,
                            #066168,
                            #14b8a6);

                    color: #fff;

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    gap: 4px;

                    font-size: 22px;

                    font-weight: 800;

                    border: 5px solid #fff;

                    box-shadow:
                        0 0 0 8px rgba(20, 184, 166, .12),
                        0 18px 34px rgba(6, 97, 104, .24);

                    z-index: 10;
                }

                /* DATE */

                .timeline-dot-date {

                    font-size: 11px;

                    font-weight: 700;

                    letter-spacing: .4px;

                    opacity: .92;

                    text-transform: uppercase;
                }

                /* ICONS */

                .timeline-dot i {

                    font-size: 24px;
                }

                /* =====================================
REMOVE OLD LINE
===================================== */

                .timeline-line {

                    display: none;
                }

                /* =====================================
DAY HEADER
===================================== */

                .activity-day-badge {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    gap: 20px;

                    margin-bottom: 22px;

                    padding: 18px 22px;

                    border-radius: 20px;

                    background:
                        linear-gradient(135deg,
                            rgba(6, 97, 104, .08),
                            rgba(20, 184, 166, .08));

                    border:
                        1px solid rgba(20, 184, 166, .18);

                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, .7);
                }

                /* =====================================
DAY NUMBER
===================================== */

                .activity-day-number {

                    display: inline-flex;

                    align-items: center;

                    justify-content: center;

                    min-width: 110px;

                    height: 48px;

                    padding: 0 22px;

                    border-radius: 999px;

                    background:
                        linear-gradient(135deg,
                            #066168,
                            #14b8a6);

                    color: #fff;

                    font-size: 18px;

                    font-weight: 800;

                    letter-spacing: .3px;

                    box-shadow:
                        0 10px 24px rgba(6, 97, 104, .22);
                }

                /* =====================================
DATE
===================================== */

                .activity-day-date {

                    font-size: 15px;

                    font-weight: 700;

                    color: #334155;

                    text-align: right;

                    line-height: 1.6;
                }

                /* =====================================
ACTIVITY CARD
===================================== */

                .activity-item {

                    border-radius: 30px !important;

                    overflow: hidden;

                    border:
                        1px solid rgba(226, 232, 240, .9);

                    box-shadow:
                        0 10px 40px rgba(15, 23, 42, .06);

                    transition: .35s ease;

                    margin-left: 36px;
                }

                .activity-item:hover {

                    transform: translateY(-5px);

                    box-shadow:
                        0 20px 50px rgba(15, 23, 42, .10);
                }

                /* =====================================
MOBILE
===================================== */

                @media(max-width:768px) {

                    .activity-timeline {

                        padding-left: 50px;
                    }

                    .timeline-item::before {

                        left: -28px;
                    }

                    .timeline-dot {

                        left: -62px;

                        width: 24px;

                        height: 24px;
                    }

                    .activity-day-badge {

                        flex-direction: column;

                        align-items: flex-start;

                        gap: 12px;

                        padding: 16px;
                    }

                    .activity-day-number {

                        min-width: auto;

                        height: 42px;

                        font-size: 16px;
                    }

                    .activity-day-date {

                        text-align: left;

                        font-size: 14px;
                    }

                    .timeline-dot {

                        left: -62px;

                        width: 62px;

                        min-height: 62px;

                        border-radius: 18px;

                        font-size: 16px;
                    }

                    .timeline-dot i {

                        font-size: 18px;
                    }

                    .timeline-dot-date {

                        font-size: 9px;
                    }

                }


                /* ACTIVITIES UNDER SAME DATE */

                /* .timeline-item:not(:has(.timeline-dot)) {

    margin-left: 40px;
} */

                /* SMALL CONNECTOR */
                /* 
.timeline-item:not(:has(.timeline-dot))::before {

    content: "";

    position: absolute;

    left: -24px;

    top: 52px;

    width: 24px;

    height: 2px;

    background: #94a3b8;
} */
            </style>

        </div>


        <div class="sidebar">





            <?php if (!empty($pickDropDetails)) { ?>
                <div class="quote-box">

                    <h3>Pickup and Drop</h3>
                    <section class="quote-section transfer-section">



                        <div class="transfer-cards">



                            <div class="transfer-card">

                                <div class="transfer-top">

                                    <div class="transfer-icon">
                                        <i class="fa-solid fa-van-shuttle"></i>
                                    </div>

                                    <div class="transfer-title-wrap">



                                        <h4>
                                            <?= $pickDropDetails['vehicle_name'] ?>

                                            <?php if (!empty($pickDropDetails['seater'])): ?>


                                                <?php if (!empty($pickDropDetails['seater'])) { ?>

                                                    (<?= $pickDropDetails['seater'] ?>)

                                                <?php } ?>

                                            <?php endif; ?>
                                        </h4>





                                    </div>

                                </div>

                                <div class="transfer-body">



                                    <div class="transfer-info">

                                        <i class="fa-solid fa-location-dot"></i>

                                        <div>

                                            <label>Pickup From</label>

                                            <p><?= htmlspecialchars($pickDropDetails['pickup']) ?></p>

                                        </div>

                                    </div>

                                    <div class="transfer-info">

                                        <i class="fa-solid fa-map-location-dot"></i>

                                        <div>

                                            <label>Drop To</label>

                                            <p><?= htmlspecialchars($pickDropDetails['drop']) ?></p>

                                        </div>

                                    </div>


                                    <!-- <div class="transfer-price">
                                                ₹ number_format($pickDropDetails['price'] , 2) ?> x <?= $pickDropDetails['qty'] ?> = ₹<?= number_format($pickDropDetails['total_price'] * $pickDropDetails['qty'], 2) ?>
                                            </div> -->




                                </div>

                            </div>




                        </div>

                    </section>
                </div>

            <?php } ?>


            <?php if (!empty($resultTransfersDetails)) { ?>
                <div class="quote-box">

                    <h3>Transfer Details</h3>
                    <section class="quote-section transfer-section">



                        <div class="transfer-cards">

                            <?php

                            mysqli_data_seek($resultTransfersDetails, 0);

                            $hasTransfer = false;

                            while ($transfer = mysqli_fetch_assoc($resultTransfersDetails)) :

                                $transferKey =
                                    $transfer['transfername'] . '_' .
                                    $transfer['vehiclename'];

                                if (in_array($transferKey, $shownTransfers)) {
                                    continue;
                                }

                                $vehicle =
                                    htmlspecialchars($transfer['vehiclename']);

                                $name =
                                    htmlspecialchars($transfer['transfername']);

                                $price =
                                    htmlspecialchars($transfer['price']);

                                $pickup2 =
                                    htmlspecialchars($transfer['pickup_name']);

                                $drop2 =
                                    htmlspecialchars($transfer['drop_name']);

                                // SKIP EMPTY TRANSFER
                                if (empty($name)) {
                                    continue;
                                }

                                $hasTransfer = true;
                            ?>

                                <div class="transfer-card">

                                    <div class="transfer-top">

                                        <div class="transfer-icon">
                                            <i class="fa-solid fa-van-shuttle"></i>
                                        </div>

                                        <div class="transfer-title-wrap">

                                            <?php if ($cityCount == 1): ?>

                                                <h4>
                                                    <?= $vehicle ?> - <?= $name ?>
                                                </h4>

                                            <?php else: ?>

                                                <?php if (!empty($transfer['seater_name'])): ?>

                                                    <h4>
                                                        <?= $vehicle ?> - <?= $name ?>

                                                        <span>
                                                            (<?= htmlspecialchars($transfer['seater_name']) ?> Seater)
                                                        </span>
                                                    </h4>

                                                <?php else: ?>

                                                    <h4>
                                                        <?= $vehicle ?> - <?= $name ?>
                                                    </h4>

                                                <?php endif; ?>

                                            <?php endif; ?>

                                        </div>

                                    </div>

                                    <div class="transfer-body">

                                        <?php if ($cityCount == 1): ?>

                                            <div class="transfer-info">

                                                <i class="fa-solid fa-location-dot"></i>

                                                <div>

                                                    <label>Pickup From</label>

                                                    <p><?= $pickup2 ?></p>

                                                </div>

                                            </div>

                                            <div class="transfer-info">

                                                <i class="fa-solid fa-map-location-dot"></i>

                                                <div>

                                                    <label>Drop To</label>

                                                    <p><?= $drop2 ?></p>

                                                </div>

                                            </div>


                                            <div class="transfer-price">
                                                ₹<?= number_format($price, 2) ?> x <?= $vehicleQuantity ?> = ₹<?= number_format($price * $vehicleQuantity, 2) ?>
                                            </div>


                                        <?php else: ?>

                                            <div class="transfer-price">
                                                ₹<?= $price ?>
                                            </div>

                                        <?php endif; ?>

                                    </div>

                                </div>

                            <?php

                                $shownTransfers[] = $transferKey;

                            endwhile;

                            /* =====================================
   NO TRANSFERS
===================================== */

                            if (!$hasTransfer) :
                            ?>

                                <p>No transfers selected.</p>

                            <?php endif; ?>

                        </div>

                    </section>
                </div>

            <?php } ?>
            <!-- 
            <div class="quote-box">

                <h3>Quotation</h3>

                <div class="quote-row">
                    <span>Package Cost</span>
                    <strong>₹ 45,000</strong>
                </div>

                <div class="quote-row">
                    <span>Markup</span>
                    <strong>₹ 4,500</strong>
                </div>

                <div class="quote-total">
                    ₹ 49,500
                </div>

            </div> -->


            <?php
            $markup2 = 0;
            $registersql = "SELECT role, agentpercentage FROM register WHERE id = '$userId'";
            $resultRegister = mysqli_query($conn, $registersql);
            while ($rowregister = mysqli_fetch_assoc($resultRegister)) {

                $role = $rowregister['role'];
                $percentage = $rowregister['agentpercentage'];

                /* =========================================================
       AGENT
    ========================================================= */

                if ($role == 'Agent') {

                    $total = $Price + $totalextraAdult + $totalChildBed;
                    
                    
                    

                    $total2 = ($total * $percentage) / 100;

                    $total3 = $total2 + $total;


                    if ($markup == '%') {

                        $finalPrice = $total3 * $totalmarkup / 100;
                    } else {

                        $finalPrice = $totalmarkup;
                    }

                    $finalPrice2 = $total3 + $finalPrice;

                    $markup2 = $total2 / $totalPeople;

                    $activitychargesperperson = $totalPrice / $totalPeople;

                    $hotelcharges = $hotelTotalPrice;

                    $hotelchargesperperson =
                        $hotelcharges / ($pax);

                    $transferperperson = $totalTransfer2;

                    $transferchargesperperson =
                        $transferperperson / $totalPeople;

                    // if ($state != 4) {

                    $transferperperson2 =
                        $totalcabprice / $totalPeople;
                    //}

                    $markupPerPerson =
                        $finalPrice / $totalPeople;

                    //  if ($state != 4) {

                    //  $perperson = $finalPrice2 / $pax;

                    //    var_dump( $totalPeople 
                    //     , $hotelchargesperperson
                    //     , $transferchargesperperson
                    //     , $markupPerPerson
                    //     , $markup2
                    //     , $transferperperson2); exit; 
                    // } else {

                    $perperson =
                        $activitychargesperperson
                        + $hotelchargesperperson
                        + $transferchargesperperson
                        + $markupPerPerson
                        + $markup2;
                    // }

                    if ($extraAdult > 0) {

                        $extraAdultTotalPrice = $totalextraAdult;
                    } else {

                        $extraAdultTotalPrice = 0;
                    }

                    if ($childBed > 0) {

                        $ChildBedTotalPrice =
                            ($totalChildBed);
                    } else {

                        $ChildBedTotalPrice = 0;
                    }

                    $totalPrice = $perperson * ($totalPeople - $extraAdult);

                    $totalPrice2 =
                        $totalPrice
                        + $extraAdultTotalPrice
                        + $ChildBedTotalPrice;

                    $person = $pax + $extraAdult;
                }

                /* =========================================================
       NORMAL USER
    ========================================================= */ else {

                    $total = $Price + $totalextraAdult + $totalChildBed;
                    
                          
              

                    if ($markup == '%') {

                        $finalPrice = $total * $totalmarkup / 100;
                    } else {

                        $finalPrice = $totalmarkup;
                    }

                    $finalPrice2 = $total + $finalPrice;
               

                    $markupPerPerson =
                        $finalPrice  / $totalPeople;

                    $activitychargesperperson =
                        $totalPrice / $totalPeople;

                    $hotelcharges = $hotelTotalPrice;

                    $hotelchargesperperson =
                        $hotelcharges / ($pax);

                    $transferperperson = $totalTransfer2;

                    $transferchargesperperson =
                        $transferperperson / $totalPeople;


                    // $perperson = $finalPrice2 / $pax;

                    //    var_dump( $totalPeople 
                    //     , $hotelchargesperperson
                    //     , $transferchargesperperson
                    //     , $markupPerPerson
                    //     , $markup2
                    //     , $transferperperson2); exit; 
                    // } else {

                    $perperson =
                        $activitychargesperperson
                        + $hotelchargesperperson
                        + $transferchargesperperson
                        + $markupPerPerson
                        + $markup2;
                    // }

                    // var_dump(    $activitychargesperperson
                    //         , $hotelchargesperperson
                    //         , $transferchargesperperson
                    //         , $markupPerPerson
                    //         , $markup2 ); exit;

                    if ($extraAdult > 0) {

                        $extraAdultTotalPrice = $totalextraAdult;
                    } else {

                        $extraAdultTotalPrice = 0;
                    }

                    if ($childBed > 0) {

                        $ChildBedTotalPrice =
                            ($totalChildBed);
                    } else {

                        $ChildBedTotalPrice = 0;
                    }

                    $totalPrice = $perperson * ($totalPeople - $extraAdult);

                    $totalPrice2 =
                        $totalPrice + $extraAdultTotalPrice;


                    //   print_R( $finalPrice); exit;     

                    //  $hotelPricePerPax = $hotelTotalPrice ;

                    //  $adultPersonPricing  = $hotelTotalPrice + $transferPerPerson + ($markupPerPerson * $pax) * $pax;
                    // $extraAdultTotalPrice = $extraAdultTotalPrice + $transferPerPerson; 

                    // $ChildBedTotalPrice = $ChildBedTotalPrice + $transferPerPerson;

                    // $perPersonPricing = $finalPrice2 / $pax;


                    //print_R( $markupShare); exit;












                    // echo "<hr>";
                    // echo "<h2>DEBUG VALUES</h2>";

                    // echo "<strong>PAX:</strong> " . $pax . "<br>";
                    // echo "<strong>Extra Adult:</strong> " . $extraAdult . "<br>";
                    // echo "<strong>Child Bed:</strong> " . $childBed . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Hotel Total Price:</strong> ₹" . number_format($hotelTotalPrice, 2) . "<br>";
                    // echo "<strong>Extra Bed Total Price:</strong> ₹" . number_format($ExtrabedTotalprice, 2) . "<br>";
                    // echo "<strong>Child Bed Total Price:</strong> ₹" . number_format($ChildbedTotalprice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Transfer Total Price:</strong> ₹" . number_format($transferTotalPrice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Cab Activity Total:</strong> ₹" . number_format($cabActivityTotal, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Activity Price (Per Person):</strong> ₹" . number_format($activityTotalPrice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Total Markup:</strong> ₹" . number_format($finalPrice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Grand Total (Final Price):</strong> ₹" . number_format($finalPrice2, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<h3>Calculated Values</h3>";

                    // echo "<strong>Adult Hotel Price:</strong> ₹" . number_format($adultHotelPrice, 2) . "<br>";
                    // echo "<strong>Extra Adult Hotel Price:</strong> ₹" . number_format($extraAdultHotelPrice, 2) . "<br>";
                    // echo "<strong>Child Hotel Price:</strong> ₹" . number_format($childHotelPrice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Transfer Share:</strong> ₹" . number_format($transferShare, 2) . "<br>";
                    // echo "<strong>Cab Activity Share:</strong> ₹" . number_format($cabActivityShare, 2) . "<br>";
                    // echo "<strong>Activity Share:</strong> ₹" . number_format($activityShare, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Adult Total:</strong> ₹" . number_format($adultPersonPricing, 2) . "<br>";
                    // echo "<strong>Extra Adult Total:</strong> ₹" . number_format($extraAdultTotalPrice, 2) . "<br>";
                    // echo "<strong>Child Total:</strong> ₹" . number_format($ChildBedTotalPrice, 2) . "<br>";

                    // echo "<hr>";

                    // echo "<strong>Grand Total From Breakdown:</strong> ₹" . number_format($grandTotal, 2) . "<br>";

                    // echo "<strong>Price Per Person:</strong> ₹" . number_format($pricePerPerson, 2) . "<br>";

                    // echo "<hr>";
            ?>



            <?php
                }

                $totalPax = $pax + $extraAdult + $childBed;

                // Hotel
                $adultHotelPrice = ($pax > 0)
                    ? ($hotelTotalPrice / $pax)
                    : 0;

                $extraAdultHotelPrice = ($extraAdult > 0)
                    ? ($ExtrabedTotalprice / $extraAdult)
                    : 0;

                $childHotelPrice = ($childBed > 0)
                    ? ($ChildbedTotalprice / $childBed)
                    : 0;

                // Transfer
                $transferShare = ($totalPax > 0)
                    ? ($transferTotalPrice / $totalPax)
                    : 0;

                // Cab Activity
                $cabActivityTotal =
                    $totalcabprice;


                //   print_R($totalcabprice); exit;

                $cabActivityTotal *= $vehicleQuantity;

                $cabActivityShare = ($totalPax > 0)
                    ? ($cabActivityTotal / $totalPax)
                    : 0;

//print_R($cabActivityTotal); exit;
                // Activity
                
                $activityVehicleShare = $grandActivityVehicleGrandTotal /   $totalPax;
                
              //  print_R(   $activityVehicleShare ); exit;
                
                $activityShare = $activityTotalPrice;
             

                // Markup
                $markupShare = ($totalPax > 0)
                    ? ($finalPrice / $totalPax)
                    : 0;


                // ===============================
                // TOTALS
                // ===============================

                // $adultPersonPricing =
                //     (
                //         $adultHotelPrice +
                //         $transferShare +
                //         $cabActivityShare +
                //         $activityShare +
                //         $markupShare
                //     ) * $pax;
                    
             

                // $extraAdultTotalPrice =
                //     (
                //         $extraAdultHotelPrice +
                //         $transferShare +
                //         $cabActivityShare +
                //         $activityShare +
                //         $markupShare
                //     ) * $extraAdult;


                // $ChildBedTotalPrice =
                //     (
                //         $childHotelPrice +
                //         $transferShare +
                //         $cabActivityShare +
                //         $activityShare +
                //         $markupShare
                //     ) * $childBed;





                $baseAdult =
                    $adultHotelPrice +
                    $transferShare +
                    $cabActivityShare +
                    $activityShare +  $activityVehicleShare;

                $baseExtraAdult =
                    $extraAdultHotelPrice +
                    $transferShare +
                    $cabActivityShare +
                    $activityShare +  $activityVehicleShare;

                $baseChild =
                    $childHotelPrice +
                    $transferShare +
                    $cabActivityShare +
                    $activityShare +  $activityVehicleShare;

                $totalBase =
                    ($baseAdult * $pax) +
                    ($baseExtraAdult * $extraAdult) +
                    ($baseChild * $childBed);
                    
                    
                    
                       $adultPersonPricingWithMarkup =
                    (
                        $adultHotelPrice +
                        $transferShare +
                        $cabActivityShare +
                        $activityShare +
                        $markupShare+  $activityVehicleShare
                    ) * $pax;


                $adultPersonPricingWithMarkup = $adultPersonPricingWithMarkup;


                $extraAdultTotalPriceWithMarkup =
                    (
                        $extraAdultHotelPrice +
                        $transferShare +
                        $cabActivityShare +
                        $activityShare +
                        $markupShare +  $activityVehicleShare
                    ) * $extraAdult;


                $ChildBedTotalPriceWithMarkup =
                    (
                        $childHotelPrice +
                        $transferShare +
                        $cabActivityShare +
                        $activityShare +
                        $markupShare +  $activityVehicleShare
                    ) * $childBed;




                $markupMultiplier =  1; // ($totalBase > 0)
                // ? ($finalPrice2 / $totalBase)
                // : 1;


                $adultPersonPricing =
                    ($baseAdult * $markupMultiplier) * $pax;





                $extraAdultTotalPrice =
                    ($baseExtraAdult * $markupMultiplier) * $extraAdult;

                $ChildBedTotalPrice =
                    ($baseChild * $markupMultiplier) * $childBed;


                $grandTotal =
                    $adultPersonPricing +
                    $extraAdultTotalPrice +
                    $ChildBedTotalPrice ;


                $pricePerPerson = $perperson;
            }

            ?>







            <style>
                .passenger-breakdown {
                    background: #ffffff;
                    border: 2px solid rgba(6, 97, 104, 0.15);
                    border-left: 6px solid #066168;
                    border-radius: 16px;
                    padding: 18px;
                    margin: 18px 0;
                    box-shadow: 0 8px 25px rgba(6, 97, 104, 0.08);
                }

                .passenger-breakdown-title {
                    color: #066168;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: .5px;
                    text-transform: uppercase;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .passenger-breakdown .quote-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px dashed #d1d5db;
                }

                .passenger-breakdown .quote-row:last-child {
                    border-bottom: none;
                }

                .passenger-breakdown .quote-row span {
                    color: #066168;
                    font-weight: 600;
                    font-size: 14px;
                }

                .passenger-breakdown .quote-row strong {
                    color: #066168;
                    font-size: 16px;
                    font-weight: 700;
                }

                .passenger-grand-total {
                    margin-top: 15px;
                    padding: 15px;
                    background: #066168;
                    color: #fff;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .passenger-grand-total span {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                }

                .passenger-grand-total strong {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                }

                .passenger-note {
                    margin-top: 12px;
                    padding: 10px 12px;
                    background: #f0f9fa;
                    border-radius: 10px;
                    color: #066168;
                    font-size: 12px;
                    border-left: 3px solid #066168;
                }
                
                
                
                
                
                
                
          .guest-count {
    padding: 15px 0;
    font-size: 15px;
    color: #fff;
}

.guest-count strong {
    color: #fff;
}

.cost-summary-title {
    margin-top: 25px;
    margin-bottom: 0;
    padding: 12px 16px;
    background: #066168;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    border-radius: 8px 8px 0 0;
}

.costing-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    background: #fff;
}

.costing-table th {
    padding: 14px 16px;
    background: #f8fafc;
    color: #066168;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    border-bottom: 2px solid #d1d5db;
}

.costing-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #374151;
}

.costing-table td:last-child,
.costing-table th:last-child {
    text-align: right;
    font-weight: 600;
}

.costing-table th:first-child,
.costing-table td:first-child {
    text-align: left;
}

.costing-table tbody tr:hover {
    background: #fafafa;
}

.final-row td {
    font-size: 17px;
    font-weight: 700;
    color: #066168;
    background: #f0f9fa;
}

.final-row td:last-child {
    color: #066168;
    font-size: 18px;
}

.grand-total-row td {
    background: #066168;
    color: #fff !important;
    font-size: 16px;
    font-weight: 700;
    border-bottom: none;
}



.summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    background: #fff;
}

.summary-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #374151;
}

.summary-table td:first-child {
    text-align: left;
}

.summary-table td:last-child {
    text-align: right;
    font-weight: 600;
    color: #111827;
}

.summary-table tbody tr:hover {
    background: #fafafa;
}
            </style>

<?php

// Ensure pricing variables with markup are strictly defined before output
if (!isset($adultPersonPricingWithMarkup) || empty($adultPersonPricingWithMarkup)) {
    $adultPersonPricingWithMarkup = (
        (isset($adultHotelPrice) ? $adultHotelPrice : 0) +
        (isset($transferShare) ? $transferShare : 0) +
        (isset($cabActivityShare) ? $cabActivityShare : 0) +
        (isset($activityShare) ? $activityShare : 0) +
        (isset($markupShare) ? $markupShare : 0) +
        (isset($activityVehicleShare) ? $activityVehicleShare : 0)
    ) * (isset($pax) ? $pax : 0);
}

if (!isset($extraAdultTotalPriceWithMarkup) || empty($extraAdultTotalPriceWithMarkup)) {
    $extraAdultTotalPriceWithMarkup = (
        (isset($extraAdultHotelPrice) ? $extraAdultHotelPrice : 0) +
        (isset($transferShare) ? $transferShare : 0) +
        (isset($cabActivityShare) ? $cabActivityShare : 0) +
        (isset($activityShare) ? $activityShare : 0) +
        (isset($markupShare) ? $markupShare : 0) +
        (isset($activityVehicleShare) ? $activityVehicleShare : 0)
    ) * (isset($extraAdult) ? $extraAdult : 0);
}

if (!isset($ChildBedTotalPriceWithMarkup) || empty($ChildBedTotalPriceWithMarkup)) {
    $ChildBedTotalPriceWithMarkup = (
        (isset($childHotelPrice) ? $childHotelPrice : 0) +
        (isset($transferShare) ? $transferShare : 0) +
        (isset($cabActivityShare) ? $cabActivityShare : 0) +
        (isset($activityShare) ? $activityShare : 0) +
        (isset($markupShare) ? $markupShare : 0) +
        (isset($activityVehicleShare) ? $activityVehicleShare : 0)
    ) * (isset($childBed) ? $childBed : 0);
}

echo "

<div class='quote-box'>

    <h3>
        💰 Costing Details
    </h3>

    <div class='guest-count'>
        <strong>No. of Guests:</strong> {$pax} Adults
    </div>

    <table class='costing-table'>

        <thead>
            <tr>
                <th>Particulars</th>
                <th>Amount</th>
            </tr>
        </thead>

        <tbody>

            <tr>
                <td>Price Per Person</td>
                <td>
                    ₹ " . number_format($pricePerPerson, 2) . "
                </td>
            </tr>


<tr>
                <td>Adults ({$pax})</td>
                <td>
                    ₹ " . number_format($adultPersonPricingWithMarkup, 2) . "
                </td>
            </tr>


";

if ($extraAdult > 0) {

    echo "

            <tr>
                <td>Extra Adult Cost ({$extraAdult})</td>
                <td>
                    ₹ " . number_format($extraAdultTotalPriceWithMarkup, 2) . "
                </td>
            </tr>

    ";
}

if ($childBed > 0) {

    echo "

            <tr>
                <td>Child Cost ({$childBed})</td>
                <td>
                    ₹ " . number_format($ChildBedTotalPriceWithMarkup, 2) . "
                </td>
            </tr>

    ";
}

echo "

            <tr class='grand-total-row'>
                <td>
                    Grand Total ({$totalPax} Pax)
                </td>
                <td>
                    ₹ " . number_format($finalPrice2, 2) . "
                </td>
            </tr>

        </tbody>

    </table>

    <div class='cost-summary-title'>
        Cost Summary
    </div>

    <table class='costing-table summary-table'>

        <tbody>

            <tr>
                <td>Net Package Cost</td>
                <td>
                    ₹ " . number_format($total, 2) . "
                </td>
            </tr>

            <tr>
                <td>Total Markup Added</td>
                <td>
                    ₹ " . number_format($finalPrice, 2) . "
                </td>
            </tr>

           <tr class='final-row'>
    <td>
        <strong>Final Amount</strong>
    </td>
    <td>
        <strong>₹ " . number_format($finalPrice2, 2) . "</strong>
    </td>
</tr>

        </tbody>

    </table>

</div>

";

?>







            <!-- =========================================================
FLOATING AI ASSISTANT
========================================================= -->

            <!-- FLOATING BUTTON -->

            <div class="ai-float-btn" id="openAssistant">

                <i class="fa-solid fa-robot"></i>

            </div>




            <style>
                /* =========================================================
AI FLOAT BUTTON
========================================================= */
                .ai-float-btn {

                    position: fixed !important;

                    right: 25px;

                    bottom: 100px;

                    width: 68px;

                    height: 68px;

                    border-radius: 999px;

                    background: linear-gradient(135deg,
                            #066168,
                            #0d9488);

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    color: #fff;

                    font-size: 28px;

                    cursor: pointer;

                    z-index: 2147483647 !important;

                    isolation: isolate;

                    border: 1px solid rgba(255, 255, 255, .9);

                    box-shadow:
                        0 15px 40px rgba(6, 97, 104, .35);

                    transform: translateZ(0);
                }

                .ai-float-btn:hover {

                    transform: scale(1.05);
                }



                /* =========================================================
CHAT WINDOW
========================================================= */
                .ai-chat-wrapper {

                    position: fixed !important;

                    right: 25px;

                    bottom: 185px;

                    width: 380px;

                    height: 650px;

                    background: #fff;

                    border-radius: 28px;

                    overflow: hidden;

                    display: flex;

                    flex-direction: column;

                    z-index: 2147483647 !important;

                    isolation: isolate;

                    border: 1px solid rgba(255, 255, 255, .9);

                    box-shadow:
                        0 25px 80px rgba(0, 0, 0, .22);

                    transform:
                        translateZ(0);

                    opacity: 0;

                    visibility: hidden;

                    transition: .35s ease;
                }

                .ai-chat-wrapper.active {

                    opacity: 1;

                    visibility: visible;

                    transform:
                        translateY(0) scale(1) translateZ(0);
                }



                /* =========================================================
HEADER
========================================================= */

                .ai-chat-header {

                    background:
                        linear-gradient(135deg,
                            #066168,
                            #0d9488);

                    padding: 18px;

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    color: #fff;
                }

                .ai-header-left {

                    display: flex;

                    align-items: center;

                    gap: 14px;
                }

                .ai-avatar {

                    width: 48px;

                    height: 48px;

                    border-radius: 999px;

                    background:
                        rgba(255, 255, 255, .15);

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    font-size: 22px;
                }

                .ai-chat-header h3 {

                    margin: 0;

                    font-size: 18px;

                    color: #fff;
                }

                .ai-chat-header span {

                    font-size: 13px;

                    opacity: .85;
                }

                #closeAssistant {

                    border: none;

                    background: none;

                    color: #fff;

                    font-size: 22px;

                    cursor: pointer;
                }



                /* =========================================================
BODY
========================================================= */

                .ai-chat-body {

                    flex: 1;

                    overflow-y: auto;

                    padding: 20px;

                    background: #f8fafc;

                    display: flex;

                    flex-direction: column;

                    gap: 14px;
                }



                /* =========================================================
MESSAGES
========================================================= */

                .ai-message {

                    max-width: 85%;

                    padding: 14px 16px;

                    border-radius: 18px;

                    font-size: 14px;

                    line-height: 1.6;
                }

                .ai-message-user {

                    background: #066168;

                    color: #fff;

                    align-self: flex-end;

                    border-bottom-right-radius: 6px;
                }

                .ai-message-bot {

                    background: #fff;

                    color: #111827;

                    align-self: flex-start;

                    border-bottom-left-radius: 6px;

                    box-shadow:
                        0 4px 15px rgba(0, 0, 0, .05);
                }



                /* =========================================================
FOOTER
========================================================= */

                .ai-chat-footer {

                    padding: 16px;

                    border-top:
                        1px solid #e2e8f0;

                    display: flex;

                    align-items: flex-end;

                    gap: 12px;

                    background: #fff;
                }

                .ai-chat-footer textarea {

                    flex: 1;

                    min-height: 55px;

                    max-height: 120px;

                    resize: none;

                    border:
                        1px solid #d1d5db;

                    border-radius: 18px;

                    padding: 14px;

                    font-family: inherit;
                }

                .ai-chat-footer button {

                    width: 52px;

                    height: 52px;

                    border: none;

                    border-radius: 16px;

                    background: #066168;

                    color: #fff;

                    font-size: 18px;

                    cursor: pointer;

                    flex-shrink: 0;
                }



                /* =========================================================
MOBILE
========================================================= */

                @media(max-width:768px) {

                    .ai-chat-wrapper {

                        width: calc(100vw - 20px);

                        height: 75vh;

                        right: 10px;

                        bottom: 90px;
                    }

                    .ai-float-btn {

                        right: 15px;
                        bottom: 110px;

                    }

                }
            </style>





            <!-- <div class="assistant">

                <h3>Assistant</h3>

                <textarea id="userInput" placeholder="Type your message..." class="form-control mb-3"></textarea>


                <button onclick="sendMessage()" class="btn primary">Send</button>



                <div class="chat-box chatbox" id="chatBox"></div>



            </div> -->

        </div>

    </div>

</div>


<div class="floating-actions">

    <div class="action-grid">

        <form action="state.php" method="post">


            <button type="submit" name="new_quotation" class="action-btn primary text-center flex items-center justify-center gap-3">
                <i class="fa-solid fa-file-circle-plus text-xl"></i>
                <span>Generate Quotation</span>
            </button>

        </form>
        <form action="generate_pdf.php" method="post">


            <button type="submit" class="action-btn green text-center flex items-center justify-center gap-3">
                <i class="fa-solid fa-file-pdf text-xl"></i>
                <span>Download PDF</span>
            </button>
        </form>

        <!-- <form action="itinerary.php" method="post">
            <button type="submit" class="action-btn blue text-center flex items-center justify-center gap-3" href="itinerary.php">
                <i class="fa-solid fa-map-location-dot text-xl"></i>
                <span>Generate Itinerary</span>
            </button>

        </form> -->


        <?php
        $editPage = 'editquatation.php';
        ?>

        <form action="<?= $editPage ?>?id=<?= $id ?>" method="post">
            <button type="submit" class="action-btn orange text-center flex items-center justify-center gap-3">
                <i class="fa-solid fa-pen-to-square text-xl"></i>
                <span>Edit Quotation</span>
            </button>

        </form>

    </div>
</div>


<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

<script>
    // document.querySelectorAll('.activity-sortable').forEach(function(el) {
    //     new Sortable(el, {
    //         animation: 150,

    //         // ❌ REMOVE THIS LINE
    //         // handle: '.drag-handle',

    //         ghostClass: 'sortable-ghost',
    //         chosenClass: 'sortable-chosen',

    //         onEnd: function() {
    //             let order = [];

    //             el.querySelectorAll('.activity-item').forEach(function(item, index) {
    //                 order.push({
    //                     id: item.getAttribute('data-id'),
    //                     position: index + 1
    //                 });
    //             });

    //             fetch('update_activity_order.php', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify(order)
    //             });
    //         }
    //     });
    // });
</script>



<!-- CHAT WINDOW -->

<div class="ai-chat-wrapper" id="assistantWrapper">

    <!-- HEADER -->

    <div class="ai-chat-header">

        <div class="ai-header-left">

            <div class="ai-avatar">

                <i class="fa-solid fa-robot"></i>

            </div>

            <div>

                <h3>Travel Assistant</h3>

                <span>Online</span>

            </div>

        </div>

        <button
            type="button"
            id="closeAssistant">

            <i class="fa-solid fa-xmark"></i>

        </button>

    </div>



    <!-- CHAT BODY -->

    <div
        class="ai-chat-body"
        id="chatBox">

        <div class="ai-message ai-message-bot">

            Hello 👋<br>
            How can I help with your itinerary?

        </div>

    </div>



    <!-- INPUT -->

    <div class="ai-chat-footer">

        <textarea
            id="userInput"
            placeholder="Type your message..."></textarea>

        <button
            type="button"
            onclick="sendMessage()">

            <i class="fa-solid fa-paper-plane"></i>

        </button>

    </div>

</div>




<script>
    /* =========================================================
OPEN / CLOSE
========================================================= */

    $("#openAssistant").on(
        "click",
        function() {

            $("#assistantWrapper")
                .addClass("active");
        }
    );

    $("#closeAssistant").on(
        "click",
        function() {

            $("#assistantWrapper")
                .removeClass("active");
        }
    );



    /* =========================================================
    SEND MESSAGE
    ========================================================= */

    function sendMessage() {

        let input =
            $("#userInput");

        let message =
            input.val().trim();

        if (message === "") {
            return;
        }

        /* USER MESSAGE */

        $("#chatBox").append(`

<div class="ai-message ai-message-user">

    ${message}

</div>

    `);

        input.val("");

        scrollChatBottom();

        /* LOADING */

        let typingId =
            "typing_" + Date.now();

        $("#chatBox").append(`

<div
    class="ai-message ai-message-bot"
    id="${typingId}"
>

    Typing...

</div>

    `);

        scrollChatBottom();

        /* REQUEST */

        fetch("generate_itinerary.php", {

                method: "POST",

                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },

                body: "message=" +
                    encodeURIComponent(message)

            })
            .then(response => response.text())

            .then(data => {

                $("#" + typingId).remove();

                $("#chatBox").append(`

<div class="ai-message ai-message-bot">

    ${data}

</div>

        `);

                scrollChatBottom();

            })

            .catch(function() {

                $("#" + typingId).remove();

                $("#chatBox").append(`

<div class="ai-message ai-message-bot">

    Something went wrong.

</div>

        `);

                scrollChatBottom();
            });
    }



    /* =========================================================
    AUTO SCROLL
    ========================================================= */

    function scrollChatBottom() {

        let chat =
            document.getElementById(
                "chatBox"
            );

        chat.scrollTop =
            chat.scrollHeight;
    }
</script>


<?php

include 'footer.php';
?>










//echo $html;
?>
