<?php

require 'utils.php';
require 'db_connect.php';

/*========================================== GetAsset =================================================*/
function getAsset($customerId) {
    global $conn;
    $result = pg_query($conn, "select id,name from asset where customer_id ='".UUIDencode($customerId)."'");
    while($row = pg_fetch_object($result))
    {
        $response[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRETTY_PRINT);
}

/*========================================== GetUser =================================================*/
function getUser($email) {
    global $conn;
    $result = pg_query($conn, "select authority, email , coalesce(first_name,'') as first_name , coalesce(last_name,'') as last_name from tb_user where email='".$email."'");
    while($row = pg_fetch_object($result))
    {
        $response[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRETTY_PRINT);
}


/*========================================== DelUser =================================================*/
function delUser($id,$token) {
    $data = api_del('https://dashboard.digitalconstructionhub.ovh/api/user/'.$id,'thgd',$token);
}


/*========================================== GetDevices =================================================*/
function getDevices($id) {
    global $conn;
    $result = pg_query($conn, "select name, id, type from device
                                where id in (select to_id from relation 
                                    where to_type = 'DEVICE' and from_id ='".$id."' and relation_type = 'Contains')
    ");
    while($row = pg_fetch_object($result))
    {
        $response[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRETTY_PRINT);
}


switch(true) {
    case (!empty($_GET["email"]) AND !empty($_GET["pass"])):
        $email = $_GET["email"];
        $pass = $_GET["pass"];
        $token = gen_token($email,$pass);
        $usr_data = JWTdecode($token);

        if(!empty($_GET["asset"])) {
            getAsset($usr_data->customerId);

        } elseif(!empty($_GET["profile"])) {
            getUser($usr_data->sub);

        } elseif(!empty($_GET["delete"])) {
            delUser($usr_data->userId,$token);

        } elseif(!empty($_GET["devices"]) AND !empty($_GET["id"]) ) {
            getDevices($_GET["id"]);
        } elseif(!empty($_GET["group"])) {
            header('Content-Type: application/json');
            echo '{"id_customer": "'.UUIDencode($usr_data->customerId).'"}';
        }
    break;

    default:
        header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
        echo '<div align="center"><font face="arial" size="10" color="#8b0000">Nothing to found here! Check the parameter</font><br />';
        break;
    
}



?>