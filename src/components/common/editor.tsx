"use client";

import YooptaEditor, {
  SlateElement,
  YooptaContentValue,
  YooptaPlugin,
  Blocks,
  YooEditor,
} from "@yoopta/editor";

import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";

import ActionMenuList, {
  DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";

import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import S3Image, { ImageElementProps } from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import File from "@yoopta/file";
import Accordion from "@yoopta/accordion";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";

import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Code from "@yoopta/code";
import Table from "@yoopta/table";
import Divider from "@yoopta/divider";
import { memo, useRef } from "react";
import { postCreatePreSignedUrl, postUploadS3 } from "@/services/api/blog/edit";
import { getImageDimensions } from "@/utils/getImageDimensions";
import { useTranslations } from "next-intl";

const plugins = [
  Paragraph,
  Table,
  Divider.extend({
    elementProps: {
      divider: (props) => ({
        ...props,
        color: "#007aff",
      }),
    },
  }),
  Accordion,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout.extend({
    options: {
      shortcuts: ["<"],
    },
  }),
  NumberedList,
  BulletedList,
  TodoList,
  Code.extend({
    options: {
      shortcuts: ["\`\`\`"],
    },
  }),
  Link,
  Embed,
  S3Image.extend({
    elementProps: {
      image: (props: ImageElementProps) => ({
        ...props,
        alt: "S3",
        fit: "contain",
      }),
    },
    options: {
      async onUpload(file) {
        const preSignedUrl = await postCreatePreSignedUrl(file.name, file.type);

        const { url, publicUrl } = preSignedUrl;

        const res = await postUploadS3(url, file);
        console.log(res, "upload completed 👾");

        const { width, height } = await getImageDimensions(file);

        return {
          src: publicUrl,
          alt: "s3_image",
          sizes: {
            width,
            height,
          },
        };
      },
    },
  }),
  Video.extend({
    options: {
      onUpload: async (file) => {
        const preSignedUrl = await postCreatePreSignedUrl(file.name, file.type);
        const { url, publicUrl } = preSignedUrl;

        const res = await postUploadS3(url, file);
        console.log(res, "upload completed 👾");

        const { width, height } = await getImageDimensions(file);

        return {
          src: publicUrl,
          alt: "s3_image",
          sizes: {
            width,
            height,
          },
        };
      },
      onUploadPoster: async (file) => {
        const preSignedUrl = await postCreatePreSignedUrl(file.name, file.type);
        const { url, publicUrl } = preSignedUrl;

        const res = await postUploadS3(url, file);
        console.log(res, "upload completed 👾");

        return publicUrl;
      },
    },
  }),
  // File.extend({
  //   options: {
  //     onUpload: async (file) => {
  //       const preSignedUrl = await postCreatePreSignedUrl(file.name, file.type);
  //       return {
  //         src: response.secure_url,
  //         format: response.format,
  //         name: response.name,
  //         size: response.bytes,
  //       };
  //     },
  //   },
  // }),
  File.extend({
    options: {
      onUpload: async (file) => {
        try {
          // 파일 크기 제한 (10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error("파일 크기는 10MB 이하여야 합니다.");
          }

          // 허용된 파일 타입 검증
          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "text/plain",
          ];
          if (!allowedTypes.includes(file.type)) {
            throw new Error("지원하지 않는 파일 형식입니다.");
          }

          const preSignedUrl = await postCreatePreSignedUrl(
            file.name,
            file.type,
          );
          const { url, publicUrl } = preSignedUrl;

          await postUploadS3(url, file);

          return {
            src: publicUrl,
            format: file.type,
            name: file.name,
            size: file.size,
          };
        } catch (error) {
          console.error("File upload failed:", error);
          throw new Error("파일 업로드에 실패했습니다.");
          // 토스트 표출
        }
      },
    },
  }),
] as YooptaPlugin<Record<string, SlateElement>, Record<string, unknown>>[];

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

const TOOLS = {
  ActionMenuList: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

interface EditorProps {
  editor: YooEditor;
  editorValue?: YooptaContentValue | undefined;

  onChangeEditorValue: (value: YooptaContentValue) => void;
  readOnly?: boolean;
}

const Editor = memo(({
  readOnly = false,
  editor,
  editorValue,
  onChangeEditorValue,
}: EditorProps) => {
  // i18n
  const t = useTranslations("blogEdit");

  const selectionRef = useRef<HTMLDivElement>(null);

  // 블록 추가
  const addBlockData = (index: number, focus = true) => {
    if (readOnly) return;

    const blockData = Blocks.buildBlockData();
    const insertBlockOptions = {
      blockData,
      at: index,
      focus,
    };
    const insertedId = editor.insertBlock("Paragraph", insertBlockOptions);

    return insertedId;
  };

  const handleEditorFocus = () => {
    if (selectionRef.current) {
      if (editor.isEmpty()) {
        addBlockData(0, true);
      } else {
        const length = Object.keys(editor.getEditorValue()).length;
        if (length <= 20) {
          addBlockData(length, false);
        }
      }
    }
  };

  return (
    <div
      className="flex flex-1 flex-col"
      ref={selectionRef}
      onClick={handleEditorFocus}
    >
      <YooptaEditor
        width="100%"
        className="flex-1 p-2"
        editor={editor}
        plugins={plugins}
        placeholder={t("contentPlaceHolder")}
        value={editorValue}
        onChange={onChangeEditorValue}
        selectionBoxRoot={selectionRef}
        tools={TOOLS}
        marks={MARKS}
        autoFocus
        readOnly={readOnly}
      />
    </div>
  );
});

Editor.displayName = "Editor";

export default Editor;
