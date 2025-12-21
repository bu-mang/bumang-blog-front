"use client";

import { useEffect, useState } from "react";
import { LuChevronLeft as ChevronLeftIcon } from "react-icons/lu";

import { getButtonColorStyle } from "@/utils/styles/filButtonManager";
import { cn } from "@/utils/cn";

import {
  TagCombobox,
  Divider,
  ComboBox,
  FillButton,
} from "@/components/common";
import { useRouter } from "@/i18n/navigation";
import { TagType, GroupType, CategoryType } from "@/types";
import DraftController from "../draftController";
import { PublishDrawer } from "@/components/pages/blog/edit/blogEditToolBar/publishDrawer";
import { useTranslations } from "next-intl";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { useTheme } from "next-themes";
import { useBlogEditorContext } from "@/contexts/BlogEditorContext";

const BlogEditorToolBar = () => {
  // Context에서 모든 값 가져오기
  const {
    groupLists,
    selectedGroup,
    onChangeSelectedGroup,
    selectedCategory,
    onChangeSelectedCategory,
    selectedTags,
    unselectedTags,
    handleSwitchTags,
    // saveStatus,
    // lastSavedAt,
  } = useBlogEditorContext();

  // i18n
  const t = useTranslations("blogEdit");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * @그룹_변경_시_카테고리_전환
   *
   * selectedCategory가 현재 selectedGroup에 속하지 않을 때만
   * 첫 번째 카테고리로 변경
   */
  useEffect(() => {
    if (!selectedGroup?.categories) return;

    const categoryBelongsToGroup = selectedGroup.categories.some(
      (cat) => cat.id === selectedCategory?.id,
    );

    // 현재 선택된 카테고리가 그룹에 속해있으면 건드리지 않음
    if (categoryBelongsToGroup) return;

    // 카테고리가 그룹에 속하지 않으면 첫 번째 카테고리로 변경
    if (selectedGroup.categories.length > 0) {
      onChangeSelectedCategory(selectedGroup.categories[0]);
    }
    // eslint-disable-next-line
  }, [selectedGroup]);

  /**
   * @버튼_스타일
   */
  const {
    fillStyle: LightFillStyle,
    textStyle: LightTextStyle,
    flexBoxClass,
  } = getButtonColorStyle(resolvedTheme === "dark" ? "dark" : "light");

  /**
   * @뒤로가기_로직
   */
  const router = useRouter();
  const handleGoBack = () => {
    router.push(PATHNAME.BLOG);
  };

  /**
   * @Auto-save_상태_포맷팅
   */
  // const formatSaveTime = (date: Date | null | undefined) => {
  //   if (!date) return "";

  //   const now = new Date();
  //   const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 초 단위

  //   if (diff < 60) {
  //     return t("header.autoSave.justNow");
  //   } else if (diff < 3600) {
  //     const minutes = Math.floor(diff / 60);
  //     return t("header.autoSave.minutesAgo", { minutes });
  //   } else {
  //     const hours = Math.floor(diff / 3600);
  //     return t("header.autoSave.hoursAgo", { hours });
  //   }
  // };

  // const renderAutoSaveStatus = () => {
  //   if (!saveStatus || saveStatus === "idle") return null;

  //   const statusConfig = {
  //     saving: {
  //       icon: <LoaderIcon className="h-3 w-3 animate-spin text-gray-400" />,
  //       text: t("header.autoSave.saving"),
  //       color: "text-gray-400",
  //     },
  //     saved: {
  //       icon: <CheckIcon className="h-3 w-3 text-green-500" />,
  //       text: formatSaveTime(lastSavedAt),
  //       color: "text-gray-400",
  //     },
  //     error: {
  //       icon: <AlertCircleIcon className="h-3 w-3 text-red-500" />,
  //       text: t("header.autoSave.error"),
  //       color: "text-red-500",
  //     },
  //   };

  //   const config = statusConfig[saveStatus];

  //   return (
  //     <div className="flex items-center gap-1.5 text-xs">
  //       {config.icon}
  //       <span className={config.color}>{config.text}</span>
  //     </div>
  //   );
  // };

  return (
    <div className="fixed left-0 top-0 z-10 flex h-14 w-full border-b-[1px] border-gray-5 bg-background shadow-sm">
      {/* LEFT MODULE */}
      <div className="flex flex-1 items-center pl-4">
        {mounted && (
          <FillButton className={LightFillStyle} onClick={handleGoBack}>
            <div className={cn(flexBoxClass, "-translate-x-1")}>
              <ChevronLeftIcon className={LightTextStyle} />
              <span className={LightTextStyle}>{t("header.backToList")}</span>
            </div>
          </FillButton>
        )}
      </div>

      {/* CENTER MODULE */}
      <div className="flex w-7/12 items-center justify-center gap-3">
        {/* GROUP BOX */}
        <ComboBox<GroupType>
          selectedValue={selectedGroup}
          handleChangeSelectedValue={onChangeSelectedGroup}
          // 전체 리스트
          selectingList={groupLists ?? []}
          iconType="folder"
          placeholder={t("header.selectGroup.button")}
          searchPlaceholder={t("header.selectGroup.inputPlaceHolder")}
        />

        <Divider />

        {/* CATEGORY BOX */}
        <ComboBox<CategoryType>
          selectedValue={selectedCategory}
          handleChangeSelectedValue={onChangeSelectedCategory}
          // 전체 리스트
          selectingList={selectedGroup?.categories ?? []}
          iconType="menu"
          placeholder={t("header.selectCategory.button")}
          searchPlaceholder={t("header.selectCategory.inputPlaceHolder")}
        />

        <Divider />

        {/* TAG BOX */}
        <TagCombobox
          selectedTags={selectedTags}
          unselectedTags={unselectedTags}
          handleSwitchTags={handleSwitchTags}
        />
      </div>

      {/* AUTO-SAVE STATUS */}
      {/* <div className="flex items-center px-4">
        {renderAutoSaveStatus()}
      </div> */}

      {/* RIGHT MODULE */}
      <div className="flex flex-1 items-center justify-end pr-4">
        <DraftController className="ml-2" />
        <Divider className="ml-3" />

        {/* 발행 버튼 */}
        <PublishDrawer />
      </div>
    </div>
  );
};

export default BlogEditorToolBar;
