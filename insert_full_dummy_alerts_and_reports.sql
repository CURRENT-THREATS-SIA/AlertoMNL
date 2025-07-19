DELIMITER $$

DROP PROCEDURE IF EXISTS insert_full_dummy_alerts_and_reports $$
CREATE PROCEDURE insert_full_dummy_alerts_and_reports()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE crime_type VARCHAR(100);
    DECLARE type_id INT;
    DECLARE zone_id INT;
    DECLARE nuser_id INT;
    DECLARE police_id INT;
    DECLARE description TEXT;
    DECLARE report_time DATETIME;
    DECLARE responding_station VARCHAR(100);
    DECLARE suspect_option VARCHAR(20);
    DECLARE suspect_description TEXT;
    DECLARE suspect_name VARCHAR(100);
    DECLARE suspect_age VARCHAR(10);
    DECLARE suspect_sex VARCHAR(20);
    DECLARE suspect_address VARCHAR(255);
    DECLARE suspect_known_description TEXT;
    DECLARE weapon_option VARCHAR(20);
    DECLARE weapon_used VARCHAR(255);
    DECLARE vehicle_option VARCHAR(20);
    DECLARE vehicle_involved VARCHAR(255);
    DECLARE crime_scene_image VARCHAR(255);
    DECLARE latitude DOUBLE;
    DECLARE longtitude DOUBLE;
    DECLARE a_address VARCHAR(255);
    DECLARE a_status VARCHAR(20);
    DECLARE alert_id INT;
    DECLARE base_date DATE;
    DECLARE rand_seconds INT;
    DECLARE month_offset INT;
    DECLARE day_offset INT;

    WHILE i < 50 DO
        -- Distribute across May, June, July 2025
        -- May: 0-16, June: 17-33, July: 34-49
        IF i < 17 THEN
            SET month_offset = 0; -- May
            SET day_offset = i;
        ELSEIF i < 34 THEN
            SET month_offset = 1; -- June
            SET day_offset = i - 17;
        ELSE
            SET month_offset = 2; -- July
            SET day_offset = i - 34;
        END IF;

        -- Generate a random number of seconds (0 to 86399) for the time part
        SET rand_seconds = FLOOR(RAND() * 86400);

        -- Dummy values for sosalert
        SET nuser_id = (i % 79) + 1; -- adjust to match your nuser table
        SET a_address = ELT((i % 8) + 1, '123 Taft Ave, Manila','456 España Blvd, Sampaloc, Manila','789 Quirino Ave, Malate, Manila','1011 Roxas Blvd, Ermita, Manila','1213 Pedro Gil St, Paco, Manila','1415 Vito Cruz St, Manila','1617 Recto Ave, Manila','1819 Dapitan St, Sampaloc, Manila');
        SET report_time = DATE_ADD(DATE_ADD('2025-05-01', INTERVAL month_offset MONTH), INTERVAL day_offset DAY);
        SET report_time = DATE_ADD(report_time, INTERVAL rand_seconds SECOND);
        SET a_status = 'pending';

        INSERT INTO sosalert (nuser_id, a_address, a_created, a_status)
        VALUES (nuser_id, a_address, report_time, a_status);

        SET alert_id = LAST_INSERT_ID();

        -- Dummy values for crimereports
        SET crime_type = ELT((i % 8) + 1, 'Murder','Homicide','Physical Injury','Rape','Robbery','Theft','Carnapping MV','Carnapping MC');
        SET type_id = (i % 3) + 1;
        SET zone_id = 1;
        SET description = ELT((i % 10) + 1, 
            'Victim reported being approached by unknown suspect who demanded wallet at gunpoint. Suspect fled on foot towards main street.',
            'Residential break-in reported. Suspect gained entry through rear window. Electronics and jewelry stolen.',
            'Vehicle theft occurred in parking lot. Owner returned to find car missing. No witnesses present.',
            'Assault reported at local bar. Victim sustained minor injuries. Suspect identified as regular patron.',
            'Robbery at convenience store. Suspect threatened cashier with knife and took cash from register.',
            'Home invasion reported. Multiple suspects involved. Family members were present during incident.',
            'Street fight escalated to assault. Multiple witnesses called police. Suspect fled scene before arrival.',
            'Carjacking reported on busy intersection. Suspect forced driver out of vehicle and drove away.',
            'Burglary at office building. Suspect broke in after hours and stole computer equipment.',
            'Domestic disturbance turned violent. Neighbors reported loud arguments followed by sounds of struggle.'
        );
        SET responding_station = CONCAT('Station ', (i % 10) + 1);
        SET suspect_option = ELT((i % 2) + 1, 'Known', 'Unknown');
        SET suspect_description = ELT((i % 8) + 1,
            'Male, approximately 25-30 years old, wearing black hoodie and jeans. Medium build, approximately 5\'8" tall.',
            'Female, early 20s, wearing red jacket and white sneakers. Long dark hair, slim build.',
            'Male, late 30s, wearing blue shirt and khaki pants. Heavy build, approximately 6\'0" tall with beard.',
            'Female, mid-40s, wearing gray sweater and black pants. Short brown hair, medium build.',
            'Male, early 20s, wearing green t-shirt and shorts. Athletic build, approximately 5\'10" tall.',
            'Female, late 20s, wearing yellow dress and sandals. Long blonde hair, slim build.',
            'Male, mid-50s, wearing white shirt and jeans. Gray hair, medium build, approximately 5\'9" tall.',
            'Female, early 30s, wearing purple jacket and jeans. Shoulder-length brown hair, medium build.'
        );
        SET suspect_name = ELT((i % 12) + 1,
            'John Santos', 'Maria Garcia', 'Michael Rodriguez', 'Ana Lopez', 'David Martinez', 'Carmen Reyes',
            'Robert Cruz', 'Isabella Torres', 'James Flores', 'Sofia Gonzalez', 'William Perez', 'Elena Morales'
        );
        SET suspect_age = CAST((18 + (i % 30)) AS CHAR);
        SET suspect_sex = ELT((i % 2) + 1, 'Male', 'Female');
        SET suspect_address = ELT((i % 10) + 1,
            '123 Mabini St, Ermita, Manila', '456 Rizal Ave, Sampaloc, Manila', '789 Bonifacio St, Tondo, Manila',
            '1011 Quezon Blvd, Quiapo, Manila', '1213 Roxas Blvd, Malate, Manila', '1415 Taft Ave, Manila',
            '1617 Pedro Gil St, Paco, Manila', '1819 Vito Cruz St, Manila', '2021 Recto Ave, Manila',
            '2223 Dapitan St, Sampaloc, Manila'
        );
        SET suspect_known_description = ELT((i % 6) + 1,
            'Previously arrested for theft in 2023. Known to frequent local bars and convenience stores.',
            'Has prior convictions for assault and battery. Known to be aggressive when intoxicated.',
            'Suspected in multiple vehicle thefts in the area. Often seen in parking lots during late hours.',
            'Known drug user with history of petty theft. Frequently seen in the neighborhood.',
            'Previously involved in domestic violence cases. Has restraining order from ex-partner.',
            'Suspected gang member with multiple arrests for robbery and assault.'
        );
        SET weapon_option = ELT((i % 3) + 1, 'Knife', 'Gun', 'None');
        SET weapon_used = ELT((i % 3) + 1, 'Kitchen Knife', 'Pistol', NULL);
        SET vehicle_option = ELT((i % 2) + 1, 'Car', 'Motorcycle');
        SET vehicle_involved = ELT((i % 2) + 1, 'Toyota Vios', 'Honda Wave');
        SET crime_scene_image = NULL;
        SET latitude = 14.5995 + (i * 0.001);
        SET longtitude = 120.9842 + (i * 0.001);

        INSERT INTO crimereports (
            alert_id, zone_id, type_id, description, latitude, longtitude, report_time, crime_type, responding_station,
            suspect_option, suspect_description, suspect_name, suspect_age, suspect_sex, suspect_address, suspect_known_description,
            weapon_option, weapon_used, vehicle_option, vehicle_involved, crime_scene_image,
            evidence_secured, items_left_behind, items_stolen, motive_known, prior_conflict, victims_involved,
            injuries_fatalities, medical_help, security_cameras
        ) VALUES (
            alert_id, zone_id, type_id, description, latitude, longtitude, report_time, crime_type, responding_station,
            suspect_option, suspect_description, suspect_name, suspect_age, suspect_sex, suspect_address, suspect_known_description,
            weapon_option, weapon_used, vehicle_option, vehicle_involved, crime_scene_image,
            ELT((i % 2) + 1, 'Yes', 'No'), -- evidence_secured
            ELT((i % 2) + 1, 'Yes', 'No'), -- items_left_behind
            ELT((i % 2) + 1, 'Yes', 'No'), -- items_stolen
            ELT((i % 2) + 1, 'Yes', 'No'), -- motive_known
            ELT((i % 2) + 1, 'Yes', 'No'), -- prior_conflict
            ELT((i % 2) + 1, 'Yes', 'No'), -- victims_involved
            ELT((i % 2) + 1, 'Yes', 'No'), -- injuries_fatalities
            ELT((i % 2) + 1, 'Yes', 'No'), -- medical_help
            ELT((i % 2) + 1, 'Yes', 'No')  -- security_cameras
        );

        -- Mandatory police officer assignment
        SET police_id = ((i + 50) % 51) + 27; -- adjust to match your police table
        INSERT INTO sosofficerassignments (alert_id, police_id) VALUES (alert_id, police_id);

        SET i = i + 1;
    END WHILE;
END $$
DELIMITER ;

CALL insert_full_dummy_alerts_and_reports();
DROP PROCEDURE insert_full_dummy_alerts_and_reports; 