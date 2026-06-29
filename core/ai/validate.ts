export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

function isString(val: unknown): val is string {
  return typeof val === 'string'
}

// Validates the Analysis Engine output per H11 §3.1, §7.3, §9.2, §11.3, §12.2.
// `alternativeIds` is the list of alternative UUIDs from the user's input (component 4).
export function validateAnalysisOutput(
  output: unknown,
  alternativeIds: string[]
): ValidationResult {
  const errors: string[] = []

  if (!isRecord(output)) {
    return { valid: false, errors: ['Analysis output is not a valid JSON object'] }
  }

  const perAlt = output.per_alternative
  if (!isArray(perAlt) || perAlt.length === 0) {
    return { valid: false, errors: ['per_alternative must be a non-empty array'] }
  }

  // 1. Every input alternative must have an entry in per_alternative (H11 §3.1)
  const foundIds = new Set<string>()
  for (const item of perAlt) {
    if (isRecord(item) && isString(item.alternative_id)) {
      foundIds.add(item.alternative_id)
    }
  }
  for (const id of alternativeIds) {
    if (!foundIds.has(id)) {
      errors.push(`Missing analysis entry for alternative id: ${id}`)
    }
  }

  // Per-alternative checks
  for (const item of perAlt) {
    if (!isRecord(item)) {
      errors.push('per_alternative contains a non-object entry')
      continue
    }
    const label = isString(item.alternative_name)
      ? `"${item.alternative_name}"`
      : `id: ${item.alternative_id}`

    // 2. Minimum 2 pros per alternative (H11 §3.1.d)
    const pros = item.pros
    if (!isArray(pros) || pros.length < 2) {
      errors.push(`${label}: minimum 2 pros required, found ${isArray(pros) ? pros.length : 0}`)
    } else {
      // 5. All pros must have specific_to_user: true (H11 §9.2)
      for (const pro of pros) {
        if (isRecord(pro) && pro.specific_to_user !== true) {
          const title = isString(pro.title) ? pro.title : '(untitled)'
          errors.push(`${label}: pro "${title}" has specific_to_user !== true`)
        }
      }
    }

    // 3. Minimum 2 cons per alternative (H11 §3.1.d)
    const cons = item.cons
    if (!isArray(cons) || cons.length < 2) {
      errors.push(`${label}: minimum 2 cons required, found ${isArray(cons) ? cons.length : 0}`)
    } else {
      // 5. All cons must have specific_to_user: true (H11 §9.2)
      for (const con of cons) {
        if (isRecord(con) && con.specific_to_user !== true) {
          const title = isString(con.title) ? con.title : '(untitled)'
          errors.push(`${label}: con "${title}" has specific_to_user !== true`)
        }
      }
    }

    // 4. Minimum 1 risk per alternative (H11 §3.1.d)
    const risks = item.risks
    if (!isArray(risks) || risks.length < 1) {
      errors.push(`${label}: minimum 1 risk required`)
    }

    // 6. hard_constraints_satisfied = false requires non-empty violations array (H11 §12.2)
    const cc = item.constraint_compliance
    if (isRecord(cc) && cc.hard_constraints_satisfied === false) {
      const violations = cc.hard_constraint_violations
      if (!isArray(violations) || violations.length === 0) {
        errors.push(
          `${label}: hard_constraints_satisfied is false but hard_constraint_violations is empty`
        )
      }
    }
  }

  // Information gap descriptions must be ≥ 20 chars (H11 §7.3)
  const crossAlt = output.cross_alternative
  if (isRecord(crossAlt)) {
    const gaps = crossAlt.information_gaps
    if (isArray(gaps)) {
      for (const gap of gaps) {
        if (!isRecord(gap)) continue
        if (isString(gap.missing_information) && gap.missing_information.length < 20) {
          errors.push(
            `information_gap.missing_information too vague (< 20 chars): "${gap.missing_information}"`
          )
        }
        if (isString(gap.impact_on_analysis) && gap.impact_on_analysis.length < 20) {
          errors.push(
            `information_gap.impact_on_analysis too vague (< 20 chars): "${gap.impact_on_analysis}"`
          )
        }
      }
    }
  }

  // analysis_confidence must be a valid tier (H11 §11.1)
  const validConfidence = ['high', 'medium', 'low']
  if (
    !isString(output.analysis_confidence) ||
    !validConfidence.includes(output.analysis_confidence)
  ) {
    errors.push('analysis_confidence must be "high", "medium", or "low"')
  }

  // confidence_rationale is always required, even for "high" (H11 §11.3)
  if (
    !isString(output.confidence_rationale) ||
    output.confidence_rationale.trim().length === 0
  ) {
    errors.push('confidence_rationale is required and must be non-empty')
  }

  return { valid: errors.length === 0, errors }
}

// Validates the Recommendation Engine output per H11 §12.1, §12.2, §11.3.
// `analysis` is the full 5_ai_analysis component content for cross-checking
// the recommended alternative's constraint compliance.
export function validateRecommendationOutput(
  output: unknown,
  analysis: unknown
): ValidationResult {
  const errors: string[] = []

  if (!isRecord(output)) {
    return { valid: false, errors: ['Recommendation output is not a valid JSON object'] }
  }

  const tieDetected = output.tie_detected === true
  const recommendedId = output.recommended_alternative_id

  // Recommendation Contract term 1: named winner or explicit tie (H11 §12.1)
  if (!tieDetected && (!isString(recommendedId) || recommendedId.trim().length === 0)) {
    errors.push('recommended_alternative_id must be non-null when tie_detected is false')
  }

  // Hard constraint enforcement: recommended alternative must not violate a hard constraint (H11 §12.2)
  if (!tieDetected && isString(recommendedId) && isRecord(analysis)) {
    const perAlt = analysis.per_alternative
    if (isArray(perAlt)) {
      const rec = perAlt.find(
        (a): a is Record<string, unknown> =>
          isRecord(a) && a.alternative_id === recommendedId
      )
      if (rec) {
        const cc = rec.constraint_compliance
        if (isRecord(cc) && cc.hard_constraints_satisfied === false) {
          const name = isString(rec.alternative_name) ? rec.alternative_name : recommendedId
          errors.push(
            `Recommended alternative "${name}" violates a hard constraint (hard_constraints_satisfied = false)`
          )
        }
      }
    }
  }

  // Recommendation Contract term 2: primary_reasoning ≥ 50 chars (H11 §12.1)
  if (
    !isString(output.primary_reasoning) ||
    output.primary_reasoning.length < 50
  ) {
    const len = isString(output.primary_reasoning) ? output.primary_reasoning.length : 0
    errors.push(`primary_reasoning must be at least 50 characters (found ${len})`)
  }

  // Recommendation Contract term 3: honest_tradeoffs non-empty (H11 §12.1)
  if (
    !isString(output.honest_tradeoffs) ||
    output.honest_tradeoffs.trim().length === 0
  ) {
    errors.push('honest_tradeoffs must be non-empty')
  }

  // Recommendation Contract term 4: conditions_for_change non-empty (H11 §12.1)
  if (
    !isString(output.conditions_for_change) ||
    output.conditions_for_change.trim().length === 0
  ) {
    errors.push('conditions_for_change must be non-empty')
  }

  // Recommendation Contract term 5: confidence_level and confidence_rationale (H11 §12.1, §11.3)
  const validConfidence = ['high', 'medium', 'low']
  if (
    !isString(output.confidence_level) ||
    !validConfidence.includes(output.confidence_level)
  ) {
    errors.push('confidence_level must be "high", "medium", or "low"')
  }
  if (
    !isString(output.confidence_rationale) ||
    output.confidence_rationale.trim().length === 0
  ) {
    errors.push('confidence_rationale is required and must be non-empty')
  }

  return { valid: errors.length === 0, errors }
}
