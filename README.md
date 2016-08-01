#PACS Bodypart API

This NodeJS module provides a REST-API interface for a facility PACS bodypart table. The API was developed using a NodeJS/Express/MongoDB stack.

##Background
Modern PACS systems typically associate a bodypart, best understood as an 'anatomical region' associated with particular imaging procedure. These bodypart values can drive a variety of application workflows and typically determine what display protocol to use and which relevant priors to hang for a particular study. The mapping of bodypart to imaging study often involves matching a study by patientID/accessionnumber to a particular HL7 order to identify the associated procedure code which is used as the "key" to look up the relevant bodypart value stored in an application config.

##Overview
This API provides an alternate interface using modern standards for the bodypart lookup. Adopting a REST-API approach to the bodypart table simplifies interactions with other 3rd party systems. For example, the facility RIS that maintains imaging procedure details could utilize the API when procedures are added/updated and these changes would be immediately available to the PACS. Convenient web-based tools could also be developed to consume the REST API.
