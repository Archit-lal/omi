import XCTest

@testable import Omi_Computer

/// Hermetic tests for the Second Brain onboarding screen-peek reply parsing and
/// fallback — the error path of the live "Omi sees your screen" moment. No live
/// vision call, screen capture, or app state involved.
@MainActor
final class SBOnboardingScreenPeekTests: XCTestCase {

  func testParsesObservationField() {
    let json = #"{"observation": "You've got a PR open past its deadline — want the follow-up drafted?"}"#
    XCTAssertEqual(
      SBOnboardingModel.parseScreenPeekObservation(json),
      "You've got a PR open past its deadline — want the follow-up drafted?")
  }

  func testTrimsSurroundingWhitespace() {
    let json = #"{"observation": "  Stale figure in that deck.\n"}"#
    XCTAssertEqual(SBOnboardingModel.parseScreenPeekObservation(json), "Stale figure in that deck.")
  }

  func testEmptyObservationReturnsNil() {
    XCTAssertNil(SBOnboardingModel.parseScreenPeekObservation(#"{"observation": "   "}"#))
  }

  func testMissingKeyReturnsNil() {
    XCTAssertNil(SBOnboardingModel.parseScreenPeekObservation(#"{"help_text": "nope"}"#))
  }

  func testMalformedJSONReturnsNil() {
    XCTAssertNil(SBOnboardingModel.parseScreenPeekObservation("not json at all"))
  }

  /// The fallback must never be empty — it's the last line of defense keeping the
  /// step from stranding the user when a live peek isn't possible.
  func testFallbackIsNonEmpty() {
    XCTAssertFalse(
      SBOnboardingModel.screenPeekFallback.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
  }
}
