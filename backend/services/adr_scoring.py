def score_checkin(symptoms: list[dict], dose_history: list[dict], regimen: list[dict]) -> dict:
    """
    Score a check-in for potential ADR.
    
    Args:
        symptoms: List of {name, severity, onset_hours_after_dose}
        dose_history: Recent dose logs {drug_name, status, timestamp}
        regimen: Patient's current regimen {drug_name, dosage}
    
    Returns:
        {
            'confidence_score': float (0-100),
            'matched_adrs': list[str],
            'root_cause_drug': str | None,
            'recommended_action': 'monitor' | 'contact_doctor' | 'seek_care_now',
            'explanation': str
        }
    """
    # TODO: Integrate with Knowledge Graph and RAG pipeline for advanced matching
    
    # Basic rule-based stub
    score = 0
    matched = []
    
    for symptom in symptoms:
        name = symptom.get('name', '').lower()
        severity = symptom.get('severity', 1) # 1-10 scale
        
        if name in ['nausea', 'vomiting', 'jaundice']:
            score += 15 * severity
            matched.append(name)
        elif name in ['vision changes', 'color blindness']:
            score += 25 * severity
            matched.append(name)
        else:
            score += 5 * severity
            matched.append(name)
            
    score = min(score, 100.0)
    
    action = 'monitor'
    if score >= 70:
        action = 'seek_care_now'
    elif score >= 30:
        action = 'contact_doctor'
        
    return {
        'confidence_score': score,
        'matched_adrs': matched,
        'root_cause_drug': 'Unknown (Stub)',
        'recommended_action': action,
        'explanation': 'Based on rule-based analysis of provided symptoms.'
    }
