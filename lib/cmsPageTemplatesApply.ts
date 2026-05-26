import { createPageSection } from "./cmsAdmin";
import {
  buildTemplateSectionStarter,
  getPageTemplate,
  type PageTemplateId,
} from "./cmsPageTemplates";

export async function applyPageTemplateToPage(
  pageId: string,
  templateId: string,
): Promise<void> {
  const template = getPageTemplate(templateId as PageTemplateId);
  let order = 0;
  for (const spec of template.sections) {
    const starter = buildTemplateSectionStarter(spec);
    const layoutVariant =
      typeof starter.settings?.layout_variant === "string"
        ? starter.settings.layout_variant
        : null;
    await createPageSection({
      page_id: pageId,
      section_type: spec.type,
      sort_order: order,
      starter: {
        ...starter,
        layout_variant: layoutVariant,
      },
    });
    order += 10;
  }
}
