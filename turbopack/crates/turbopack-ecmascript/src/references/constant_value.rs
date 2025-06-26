use std::sync::Arc;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use swc_core::{
    common::{FileName, SourceMap, errors::HANDLER},
    ecma::parser::parse_file_as_expr,
    quote,
};
use turbo_tasks::{NonLocalValue, TaskInput, Vc, debug::ValueDebugFormat, trace::TraceRawVcs};
use turbopack_core::{
    chunk::ChunkingContext, compile_time_info::CompileTimeDefineValue, module_graph::ModuleGraph,
};

use super::AstPath;
use crate::{
    code_gen::{CodeGen, CodeGeneration},
    create_visitor,
};

#[derive(
    Clone,
    Debug,
    PartialEq,
    Eq,
    Hash,
    Serialize,
    Deserialize,
    TraceRawVcs,
    ValueDebugFormat,
    NonLocalValue,
    TaskInput,
)]
pub struct ConstantValueCodeGen {
    value: CompileTimeDefineValue,
    path: AstPath,
}

impl ConstantValueCodeGen {
    pub fn new(value: CompileTimeDefineValue, path: AstPath) -> Self {
        ConstantValueCodeGen { value, path }
    }
    pub async fn code_generation(
        &self,
        _module_graph: Vc<ModuleGraph>,
        _chunking_context: Vc<Box<dyn ChunkingContext>>,
    ) -> Result<CodeGeneration> {
        let value = self.value.clone();

        let visitor = create_visitor!(self.path, visit_mut_expr(expr: &mut Expr) {
            let value = match value {
                CompileTimeDefineValue::Bool(true) => {
                    quote!("(\"TURBOPACK compile-time value\", true)" as Expr)
                }
                CompileTimeDefineValue::Bool(false) => {
                    quote!("(\"TURBOPACK compile-time value\", false)" as Expr)
                }
                CompileTimeDefineValue::String(ref s) => {
                    quote!("(\"TURBOPACK compile-time value\", $e)" as Expr, e: Expr = s.to_string().into())
                }
                CompileTimeDefineValue::JSON(ref s) => {
                    let json = *parse_file_as_expr(
                        &SourceMap::default().new_source_file(Arc::new(FileName::Anon), s.to_string()),
                        swc_core::ecma::parser::Syntax::Es(Default::default()),
                        swc_core::ecma::ast::EsVersion::EsNext,
                        None,
                        &mut vec![],
                    )
                    .map_err(|err| HANDLER.with(|handler| err.into_diagnostic(handler).emit()))
                    .unwrap();
                    quote!("(\"TURBOPACK compile-time value\", $e)" as Expr, e: Expr = json)
                }
                CompileTimeDefineValue::Undefined => {
                    // undefined can be re-bound, so use `void 0` to avoid any risks
                    quote!("(\"TURBOPACK compile-time value\", void 0)" as Expr)
                }
            };
            *expr = value;
        });

        Ok(CodeGeneration::visitors(vec![visitor]))
    }
}

impl From<ConstantValueCodeGen> for CodeGen {
    fn from(val: ConstantValueCodeGen) -> Self {
        CodeGen::ConstantValueCodeGen(val)
    }
}
