/**
 * This component allow to display a small number of artists using different critera
 *   - recently added
 *   - most popular
 *   - has new sutff
 *   - most listened
 */
enum ArtistsFilterMode{
  RECENTLY_ADDED,
  MOST_POPULAR,
  HAS_NEW_RELEASES,
  MOST_LISTENED
}
interface ArtistsWidgetParams {
  mode?: ArtistsFilterMode
}

export const ArtistsWidget = ({mode = ArtistsFilterMode.RECENTLY_ADDED}: ArtistsWidgetParams) => {
  return <div className="flex gap-4">
      { mode }
  </div>
}
export default ArtistsWidget