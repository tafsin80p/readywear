import connectToDatabase from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import Category from "@/models/Category";

export interface OfferCategoryFilter {
  isOfferCategoryOnly: boolean;
  allowedCategorySlugs: string[];
  allowedCategoryNames: string[];
  allowedSlugsAndNames: string[];
}

/**
 * Checks whether the exclusive offer category mode is active in StoreSettings.
 * If active, returns all allowed category slugs and names (including subcategories).
 * If inactive, returns isOfferCategoryOnly: false.
 */
export async function getActiveOfferCategoryFilter(): Promise<OfferCategoryFilter> {
  try {
    await connectToDatabase();
    const settings: any = await StoreSettings.findOne().lean();

    if (
      !settings ||
      !settings.offerCategoriesOnly ||
      !settings.offerCategorySlugs ||
      !Array.isArray(settings.offerCategorySlugs) ||
      settings.offerCategorySlugs.length === 0
    ) {
      return {
        isOfferCategoryOnly: false,
        allowedCategorySlugs: [],
        allowedCategoryNames: [],
        allowedSlugsAndNames: [],
      };
    }

    const selectedSlugs = settings.offerCategorySlugs.filter(Boolean);
    if (selectedSlugs.length === 0) {
      return {
        isOfferCategoryOnly: false,
        allowedCategorySlugs: [],
        allowedCategoryNames: [],
        allowedSlugsAndNames: [],
      };
    }

    // Find all matching categories and any children/subcategories
    const matchedCategories = await Category.find({
      isActive: true,
      $or: [
        { slug: { $in: selectedSlugs } },
        { name: { $in: selectedSlugs } },
        { parentCategory: { $in: selectedSlugs } },
      ],
    }).lean();

    const allowedCategorySlugs = new Set<string>();
    const allowedCategoryNames = new Set<string>();

    selectedSlugs.forEach((s: string) => {
      allowedCategorySlugs.add(s);
    });

    matchedCategories.forEach((c: any) => {
      if (c.slug) allowedCategorySlugs.add(c.slug);
      if (c.name) allowedCategoryNames.add(c.name);
    });

    const allowedSlugsAndNames = Array.from(
      new Set([...allowedCategorySlugs, ...allowedCategoryNames])
    );

    return {
      isOfferCategoryOnly: true,
      allowedCategorySlugs: Array.from(allowedCategorySlugs),
      allowedCategoryNames: Array.from(allowedCategoryNames),
      allowedSlugsAndNames,
    };
  } catch (error) {
    console.error("Error in getActiveOfferCategoryFilter:", error);
    return {
      isOfferCategoryOnly: false,
      allowedCategorySlugs: [],
      allowedCategoryNames: [],
      allowedSlugsAndNames: [],
    };
  }
}
